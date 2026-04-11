import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.emailSupport.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.EmailSupportWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['name', 'email', 'subject', 'message', 'orderId'].map((field) => ({
        [field]: {
          contains: searchTerm as string,
          mode: 'insensitive',
        },
      })) as any,
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

  const whereConditions: Prisma.EmailSupportWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.emailSupport.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.emailSupport.count({ where: whereConditions });

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
  const result = await prisma.emailSupport.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'EmailSupport not found');
  }
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.emailSupport.delete({
    where: { id },
  });
  return result;
};

export const EmailSupportService = {
  create,
  getAll,
  getById,
  deleteById,
};
