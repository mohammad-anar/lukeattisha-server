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

const getById = async (id: string) => {
  const result = await prisma.adSubscription.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'AdSubscription not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.adSubscription.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
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

export const AdSubscriptionService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  createCheckoutSession,
};
