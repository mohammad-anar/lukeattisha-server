import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.fAQ.create({
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
      OR: ["question", "answer"].map((field) => ({
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

  const whereConditions: Prisma.FAQWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.fAQ.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
  });
  const total = await prisma.fAQ.count({ where: whereConditions });

  return {
    meta: { total, totalPage: Math.ceil(total / limit), page, limit },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.fAQ.findUnique({
    where: { id },
  });
  if (!result) throw new ApiError(404, 'FAQ not found');
  return result;
};

const update = async (id: string, payload: any) => {
  const result = await prisma.fAQ.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.fAQ.delete({
    where: { id },
  });
  return result;
};

export const FAQService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
