import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const operatorId = payload.operatorId;
  const categoryIds = payload.categoryIds;
  console.log(operatorId, categoryIds);

  const result = categoryIds.map((categoryId: string) => {
    return { operatorId, categoryId }
  });

  const created = await prisma.operatorCategory.createMany({
    data: result,
  });
  return created;
};

const getAll = async (operatorId: string, filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  andConditions.push({
    operatorId: operatorId,
  });

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

  const whereConditions: Prisma.OperatorCategoryWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.operatorCategory.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      category: true,
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.operatorCategory.count({ where: whereConditions });

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
  const result = await prisma.operatorCategory.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'OperatorCategory not found');
  }
  return result;
};

const update = async (operatorId: string, id: string, payload: any) => {
  console.log(operatorId, id, payload);

  const isOperatorCategoryExist = await prisma.operatorCategory.findFirst({
    where: {
      operatorId: operatorId,
      id: id,
    },
  });

  if (!isOperatorCategoryExist) {
    throw new ApiError(404, 'OperatorCategory not found');
  }

  const result = await prisma.operatorCategory.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.operatorCategory.delete({
    where: { id },
  });
  return result;
};

export const OperatorCategoryService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
