import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  if (payload.userId) {
    const userPref = await prisma.userNotificationPreference.findUnique({
      where: { userId: payload.userId }
    });
    // Default is push = true. If explicitly false, block it.
    if (userPref && userPref.push === false) {
      console.log(`Push Service: Blocked notification for user [${payload.userId}] due to preference`);
      return null;
    }
  }

  const result = await prisma.notification.create({
    data: payload,
  });

  if (payload.userId) {
    try {
      const socketHelper = await import('../../../helpers.ts/socketHelper.js');
      socketHelper.emitToUser(payload.userId, 'new-notification', result);
    } catch (err) {
      console.error('Push Service: Socket emission failed', err);
    }
  }

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["title","message"].map((field) => ({
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

  const whereConditions: Prisma.NotificationWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.notification.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.notification.count({ where: whereConditions });

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
  const result = await prisma.notification.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Notification not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.notification.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.notification.delete({
    where: { id },
  });
  return result;
};

export const NotificationService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
