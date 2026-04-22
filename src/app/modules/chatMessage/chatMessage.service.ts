import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.chatMessage.create({
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
      OR: ["content"].map((field) => ({
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

  const whereConditions: Prisma.ChatMessageWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.chatMessage.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'asc' }, // usually messages are older to newer
    include: {
        senderUser: {
            select: { id: true, name: true, avatar: true }
        },
        senderOperator: {
            select: { id: true, user: { select: { id: true, name: true, avatar: true } } }
        }
    }
  });
  const total = await prisma.chatMessage.count({ where: whereConditions });

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

const getByRoomId = async (roomId: string, options: any) => {
    return await getAll({ roomId }, options);
};

const getById = async (id: string) => {
  const result = await prisma.chatMessage.findUnique({
    where: { id },
    include: {
        senderUser: {
            select: { id: true, name: true, avatar: true }
        },
        senderOperator: {
            select: { id: true, user: { select: { id: true, name: true, avatar: true } } }
        }
    }
  });
  if (!result) {
    throw new ApiError(404, 'ChatMessage not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.chatMessage.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.chatMessage.delete({
    where: { id },
  });
  return result;
};

const getAdminUnreadMessages = async (userId: string, queryRoomId?: string) => {
  const whereCondition: any = { userId };
  if (queryRoomId) {
    whereCondition.roomId = queryRoomId;
  }

  const participants = await prisma.chatParticipant.findMany({
    where: whereCondition,
    select: { roomId: true, lastRead: true, joinedAt: true },
  });

  const unreadCounts = await Promise.all(
    participants.map(async (p) => {
      const count = await prisma.chatMessage.count({
        where: {
          roomId: p.roomId,
          senderUserId: { not: userId },
          createdAt: {
            gt: p.lastRead || p.joinedAt || new Date(0),
          },
        },
      });
      return {
        roomId: p.roomId,
        unreadMessageCount: count,
      };
    })
  );

  return queryRoomId ? unreadCounts : unreadCounts.filter((item) => item.unreadMessageCount > 0);
};

export const ChatMessageService = {
  create,
  getAll,
  getById,
  getByRoomId,
  getAdminUnreadMessages,
  update,
  deleteById,
};
