import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.store.create({
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
      OR: ["name", "address", "city"].map((field) => ({
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

  const whereConditions: Prisma.StoreWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.store.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.store.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getByOperatorId = async (filters: any, options: any, operatorId: string) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, isActive, ...filterData } = filters;

  const andConditions: any[] = [{ operatorId }];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "address", "city"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (isActive !== undefined) {
    andConditions.push({
      isActive: isActive === 'true' || isActive === true,
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

  const whereConditions: Prisma.StoreWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.store.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: { operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } } },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.store.count({ where: whereConditions });

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
  const result = await prisma.store.findUnique({
    where: { id },
    include: { operator: { select: { user: { select: { name: true, email: true, phone: true, avatar: true } } } }, storeServices: { select: { service: true } }, storeBundles: { select: { bundle: true } } }
  });
  if (!result) {
    throw new ApiError(404, 'Store not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.store.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.store.delete({
    where: { id },
  });
  return result;
};

export const StoreService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getByOperatorId
};
