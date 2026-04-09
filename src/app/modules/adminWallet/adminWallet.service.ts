import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.adminWallet.create({
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

  const whereConditions: Prisma.AdminWalletWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.adminWallet.findMany({
    where: whereConditions,
    skip,
    take: limit,
    // orderBy:
    // sortBy && sortOrder
    //   ? { [sortBy]: sortOrder }
    //   : { createdAt: 'desc' },
  });
  const total = await prisma.adminWallet.count({ where: whereConditions });

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

// getBy admin id 
const getByAdminId = async (adminId: string) => {
  const result = await prisma.adminWallet.findUnique({
    where: { userId: adminId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        }
      }
    }
  });
  if (!result) {
    throw new ApiError(404, 'AdminWallet not found');
  }
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.adminWallet.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'AdminWallet not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.adminWallet.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.adminWallet.delete({
    where: { id },
  });
  return result;
};

export const AdminWalletService = {
  create,
  getAll,
  getById,
  getByAdminId,
  update,
  deleteById,
};
