import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { emitToRoom } from '../../../helpers.ts/socketHelper.js';

const getOrCreateRoom = async (userId: string) => {
  // Check if room already exists for this user
  let room = await prisma.liveSupportRoom.findUnique({
    where: { userId },
  });

  if (!room) {
    room = await prisma.liveSupportRoom.create({
      data: {
        userId,
      },
    });
  }

  return room;
};

const sendMessage = async (payload: {
  roomId: string;
  senderId: string;
  content: string;
  images?: string[];
}) => {
  const { roomId, senderId, content, images } = payload;

  // Verify room exists
  const room = await prisma.liveSupportRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new ApiError(404, 'Support room not found');
  }

  const result = await prisma.liveSupportMessage.create({
    data: {
      roomId,
      senderId,
      content,
      images: (images || []) as any,
    } as any,
    include: {
      room: true,
    },
  });

  // Update room's updatedAt
  await prisma.liveSupportRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });

  // Broadcast via socket
  emitToRoom(`room:${roomId}`, 'new-message', result);

  return result;
};

// get my room
const getMyRoom = async (userId: string) => {
  const result = await prisma.liveSupportRoom.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return result;
};

const getMessages = async (roomId: string) => {
  const result = await prisma.liveSupportMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
  });
  return result;
};

const getAllRooms = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditions: Prisma.LiveSupportRoomWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      user: {
        name: {
          contains: searchTerm as string,
          mode: 'insensitive',
        },
      },
    });
  }

  const whereConditions: Prisma.LiveSupportRoomWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.liveSupportRoom.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { updatedAt: 'desc' },
  });

  const total = await prisma.liveSupportRoom.count({ where: whereConditions });

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

export const LiveSupportService = {
  getOrCreateRoom,
  sendMessage,
  getMessages,
  getAllRooms,
  getMyRoom,
};
