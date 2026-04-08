import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.userSubscription.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: [].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
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

  const whereConditions: Prisma.UserSubscriptionWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.userSubscription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.userSubscription.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.userSubscription.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'UserSubscription not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.userSubscription.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.userSubscription.delete({
    where: { id },
  });
  return result;
};

const activateIAP = async (userId: string, payload: { planId: string, receiptData: string }) => {
  const { planId, receiptData } = payload;

  const plan = await prisma.userSubscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan) throw new ApiError(404, 'Subscription plan not found');

  // In a real app, you would validate the receipt with Apple/Google here.
  // For now, we'll assume it's valid and activate the subscription.
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonth);

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isSubscribed: true }
    });

    return await tx.userSubscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: 'ACTIVE',
        stripePaymentId: `iap_${Date.now()}` // Placeholder for IAP transaction ID
      }
    });
  });

  return result;
};

export const UserSubscriptionService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  activateIAP
};
