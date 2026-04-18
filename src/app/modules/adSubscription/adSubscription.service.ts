import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { config } from '../../../config/index.js';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';

const create = async (payload: any) => {
  const result = await prisma.adSubscription.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any, user: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: any[] = [];

  // Role-based filtering
  if (user.role === 'OPERATOR') {
    const operator = await prisma.operator.findUnique({
      where: { userId: user.id }
    });
    if (!operator) throw new ApiError(404, 'Operator profile not found');

    andConditions.push({ operatorId: operator.id });
    
    // Only active and cancelled for operators as requested
    andConditions.push({
      status: { in: ['ACTIVE', 'CANCELLED'] }
    });
  }

  if (searchTerm) {
    // Add searchable fields if any
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AdSubscriptionWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.adSubscription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.adSubscription.count({ where: whereConditions });

  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string, user: any) => {
  const result = await prisma.adSubscription.findUnique({
    where: { id },
    include: { operator: true }
  });
  if (!result) {
    throw new ApiError(404, 'AdSubscription not found');
  }

  // Ownership validation
  if (user.role === 'OPERATOR' && result.operator.userId !== user.id) {
    throw new ApiError(403, 'Forbidden: You can only view your own subscriptions');
  }

  return result;
};

const update = async (id: string, payload: any, user: any) => {
  await getById(id, user);
  const result = await prisma.adSubscription.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string, user: any) => {
  await getById(id, user);
  const result = await prisma.adSubscription.delete({
    where: { id },
  });
  return result;
};

const createCheckoutSession = async (operatorId: string, payload: { planId: string }) => {
  const { planId } = payload;
  const plan = await prisma.adSubscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new ApiError(404, 'Ad subscription plan not found');
  }

  const sessionUrl = await StripeHelpers.createOperatorAdSubscriptionSession(
    operatorId,
    plan.id,
    plan.name,
    Number(plan.price)
  );

  return { url: sessionUrl };
};

const cancelSubscription = async (id: string, user: any) => {
  const subContent = await prisma.adSubscription.findUnique({
    where: { id },
    include: { operator: true }
  });

  if (!subContent) throw new ApiError(404, 'Subscription not found');

  // Only Operators can cancel, and only their own subscriptions
  if (user.role !== 'OPERATOR') {
    throw new ApiError(403, 'Forbidden: Only Operators can cancel their own subscriptions');
  }

  if (subContent.operator.userId !== user.id) {
    throw new ApiError(403, 'Forbidden: You can only cancel your own subscriptions');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update subscription status
    const subscription = await tx.adSubscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { operator: true },
    });

    // 2. Expire all linked ads
    await tx.ad.updateMany({
      where: { subscriptionId: id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    // 3. Update operator user's isSubscribed status
    await tx.user.update({
      where: { id: subscription.operator.userId },
      data: { isSubscribed: false },
    });

    return subscription;
  });

  return result;
};

export const AdSubscriptionService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  createCheckoutSession,
  cancelSubscription,
};
