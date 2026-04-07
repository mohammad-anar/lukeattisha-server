import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const { storeServiceId, storeBundleId, ...rest } = payload;

  if (storeServiceId) {
    const storeService = await prisma.storeService.findUnique({
      where: { id: storeServiceId },
    });

    if (!storeService) {
      throw new ApiError(404, 'Store Service not found');
    }
  }

  if (storeBundleId) {
    const storeBundle = await prisma.storeBundle.findUnique({
      where: { id: storeBundleId },
    });

    if (!storeBundle) {
      throw new ApiError(404, 'Store Bundle not found');
    }
  }

  const result = await prisma.review.create({
    data: {
      ...rest,
      storeServiceId,
      storeBundleId,
    },
  });

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, operatorId, storeId, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["comment"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (operatorId) {
    andConditions.push({
      OR: [
        { service: { store: { operatorId } } },
        { bundle: { store: { operatorId } } }
      ]
    });
  }

  if (storeId) {
    andConditions.push({
      OR: [
        { service: { storeId } },
        { bundle: { storeId } }
      ]
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

  const whereConditions: Prisma.ReviewWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
        }
      },
      service: {
        include: {
          service: true,
          store: true
        }
      },
      bundle: {
        include: {
          bundle: true,
          store: true
        }
      },

    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.review.count({ where: whereConditions });

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
  const result = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
        }
      },
      service: {
        include: {
          service: true,
          store: true
        }
      },
      bundle: {
        include: {
          bundle: true,
          store: true
        }
      }
    }
  });
  if (!result) {
    throw new ApiError(404, 'Review not found');
  }
  return result;
};

const getByOperatorId = async (operatorId: string, options: any) => {
  return await getAll({ operatorId }, options);
};

const getByUserId = async (userId: string, options: any) => {
  return await getAll({ userId }, options);
};

const getByStoreId = async (storeId: string, options: any) => {
  return await getAll({ storeId }, options);
};

const getByStoreServiceId = async (storeServiceId: string, options: any) => {
  return await getAll({ storeServiceId }, options);
};

const getByStoreBundleId = async (storeBundleId: string, options: any) => {
  return await getAll({ storeBundleId }, options);
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.review.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.review.delete({
    where: { id },
  });
  return result;
};

export const ReviewService = {
  create,
  getAll,
  getById,
  getByOperatorId,
  getByUserId,
  getByStoreId,
  getByStoreServiceId,
  getByStoreBundleId,
  update,
  deleteById,
};
