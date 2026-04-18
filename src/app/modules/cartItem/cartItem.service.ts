import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.cartItem.create({
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

  const whereConditions: Prisma.CartItemWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.cartItem.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.cartItem.count({ where: whereConditions });

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
  const result = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      selectedAddons: {
        include: { addon: true }
      },
      storeService: {
        include: { service: true }
      },
      storeBundle: {
        include: { bundle: true }
      }
    }
  });
  if (!result) {
    throw new ApiError(404, 'CartItem not found');
  }
  return result;
};

const getByCartId = async (cartId: string) => {
  const result = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      selectedAddons: {
        include: { addon: true }
      },
      storeService: {
        include: { service: true }
      },
      storeBundle: {
        include: { bundle: true }
      }
    }
  });
  return result;
};

const update = async (id: string, payload: any) => {
  const cartItem = await getById(id);
  
  if (payload.quantity !== undefined) {
    const unitPrice = Number(cartItem.price) / cartItem.quantity;
    payload.price = unitPrice * payload.quantity;
  }

  const result = await prisma.cartItem.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.cartItem.delete({
    where: { id },
  });
  return result;
};

export const CartItemService = {
  create,
  getAll,
  getById,
  getByCartId,
  update,
  deleteById,
};
