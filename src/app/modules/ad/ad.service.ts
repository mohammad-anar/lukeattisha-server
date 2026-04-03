import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const { operatorId, serviceId, bundleId } = payload;

  const now = new Date();

  // Find an active subscription for this operator
  const activeSubscription = await prisma.adSubscription.findFirst({
    where: {
      operatorId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!activeSubscription) {
    throw new ApiError(403, "No active Ad Subscription found for this operator. Please purchase a plan first.");
  }

  const result = await prisma.ad.create({
    data: {
      operatorId,
      serviceId,
      bundleId,
      subscriptionId: activeSubscription.id,
      status: "PENDING", // Admins might need to approve the ad content
    },
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

  const whereConditions: Prisma.AdWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.ad.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.ad.count({ where: whereConditions });

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
  const result = await prisma.ad.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Ad not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.ad.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.ad.delete({
    where: { id },
  });
  return result;
};

export const AdService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
