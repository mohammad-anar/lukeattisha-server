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
  const whereCondition: Prisma.ChatRoomWhereInput = {};
  if (queryRoomId) {
    whereCondition.id = queryRoomId;
  }

  const rooms = await prisma.chatRoom.findMany({
    where: whereCondition,
    select: {
      id: true,
      participants: {
        where: { userId },
        select: { lastRead: true, joinedAt: true }
      }
    }
  });

  const unreadCounts = await Promise.all(
    rooms.map(async (room) => {
      const adminParticipant = room.participants[0];
      const lastRead = adminParticipant?.lastRead || adminParticipant?.joinedAt || new Date(0);

      const count = await prisma.chatMessage.count({
        where: {
          roomId: room.id,
          senderUserId: { not: userId },
          createdAt: {
            gt: lastRead,
          },
        },
      });

      return {
        roomId: room.id,
        unreadMessageCount: count,
      };
    })
  );

  const filteredData = queryRoomId 
    ? unreadCounts[0] || { roomId: queryRoomId, unreadMessageCount: 0 } 
    : unreadCounts.filter((item) => item.unreadMessageCount > 0);

  const totalUnreadMessages = unreadCounts.reduce((sum, item) => sum + item.unreadMessageCount, 0);

  return {
    meta: {
      total:totalUnreadMessages,
    },
    data: filteredData,
  };
};

const markRoomMessagesAsRead = async (user: any, roomId: string) => {
  const { id: userId, role } = user;
  
  let participantWhere: Prisma.ChatParticipantWhereInput;
  if (role === 'OPERATOR') {
    participantWhere = { roomId, operator: { userId } };
  } else {
    participantWhere = { roomId, userId };
  }
  
  const participant = await prisma.chatParticipant.findFirst({
    where: participantWhere
  });

  if (participant) {
    await prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { lastRead: new Date() }
    });
  } else {
    // If admin and participant doesn't exist, create one to track read status
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      await prisma.chatParticipant.create({
        data: {
          roomId,
          userId,
          lastRead: new Date(),
          joinedAt: new Date()
        }
      });
    } else {
      throw new ApiError(403, 'You are not a participant in this room');
    }
  }

  return { message: 'Messages marked as read' };
};

export const ChatMessageService = {
  create,
  getAll,
  getById,
  getByRoomId,
  getAdminUnreadMessages,
  markRoomMessagesAsRead,
  update,
  deleteById,
};
