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
  const { searchTerm,userId, ...filterData } = filters;

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

  if (userId) {
    andConditions.push({
      userId: {
        equals: userId,
      },
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

const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result;
};

const markAsRead = async (notificationId: string, userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  return result;
};

const sendToUser = async (userId: string, title: string, message: string, type: 'ORDER_UPDATE' | 'PROMOTION' | 'SYSTEM' = 'SYSTEM') => {
  return await create({
    userId,
    title,
    message,
    type,
    channel: 'IN_APP'
  });
};

const sendToAdmins = async (title: string, message: string, type: 'SYSTEM' = 'SYSTEM') => {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true }
  });

  const notifications = admins.map(admin => ({
    userId: admin.id,
    title,
    message,
    type,
    channel: 'IN_APP'
  }));

  // Since create() has side effects (socket), we loop or use a modified create
  const results = [];
  for (const n of notifications) {
    results.push(await create(n));
  }
  return results;
};

const sendToAll = async (title: string, message: string, type: 'PROMOTION' = 'PROMOTION') => {
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  const results = [];
  for (const user of users) {
    results.push(await create({
      userId: user.id,
      title,
      message,
      type,
      channel: 'IN_APP'
    }));
  }
  return results;
};

const sendToOperators = async (title: string, message: string, type: 'SYSTEM' = 'SYSTEM') => {
  const operators = await prisma.user.findMany({
    where: { role: 'OPERATOR' },
    select: { id: true }
  });

  const results = [];
  for (const op of operators) {
    results.push(await create({
      userId: op.id,
      title,
      message,
      type,
      channel: 'IN_APP'
    }));
  }
  return results;
};

const sendToUsers = async (title: string, message: string, type: 'PROMOTION' = 'PROMOTION') => {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true }
  });

  const results = [];
  for (const user of users) {
    results.push(await create({
      userId: user.id,
      title,
      message,
      type,
      channel: 'IN_APP'
    }));
  }
  return results;
};

export const NotificationService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  markAllAsRead,
  markAsRead,
  sendToUser,
  sendToAdmins,
  sendToAll,
  sendToOperators,
  sendToUsers
};
