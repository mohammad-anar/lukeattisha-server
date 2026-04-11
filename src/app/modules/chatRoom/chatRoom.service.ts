import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.chatRoom.create({
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
      OR: ["name"].map((field) => ({
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

  const whereConditions: Prisma.ChatRoomWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.chatRoom.findMany({
    where: whereConditions,
    skip,
    include: {
      participants: {
        include: {
          user: { select: { name: true, email: true, role: true, avatar: true } },
          operator: { select: { user: { select: { name: true, avatar: true } } } }
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  const total = await prisma.chatRoom.count({ where: whereConditions });

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
  const result = await prisma.chatRoom.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, role: true, avatar: true } },
          operator: { select: { id: true, user: { select: { name: true, avatar: true } } } }
        }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          senderUser: { select: { name: true, avatar: true } },
          senderOperator: { select: { user: { select: { name: true, avatar: true } } } }
        }
      }
    }
  });
  if (!result) {
    throw new ApiError(404, 'ChatRoom not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.chatRoom.update({
    where: { id },
    data: payload,
  });
  return result;
};

const getMyRooms = async (userId: string, role: string) => {
  const where: Prisma.ChatRoomWhereInput = {
    participants: {
      some: role === 'OPERATOR' ? { operator: { userId } } : { userId }
    }
  };

  const result = await prisma.chatRoom.findMany({
    where,
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, role: true, avatar: true } },
          operator: { select: { id: true, user: { select: { name: true, avatar: true } } } }
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return result;
};

const getOrCreateSupportRoom = async (userId: string) => {
  // 1. Check if an active live support room exists for this user
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      participants: { some: { userId } },
      ticket: { type: 'LIVE_CHAT', status: { notIn: ['RESOLVED', 'CLOSED'] } }
    }
  });

  if (existingRoom) return existingRoom;

  // 2. Create a new support ticket and room
  const result = await prisma.$transaction(async (tx) => {
    const ticketNumber = `SUP-${Date.now()}`;
    const ticket = await tx.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: 'Live Chat Support',
        description: 'Auto-generated for live chat session',
        type: 'LIVE_CHAT',
        status: 'OPEN'
      }
    });

    const room = await tx.chatRoom.create({
      data: {
        name: 'Live Support',
        ticketId: ticket.id,
      }
    });

    // Add user as participant
    await tx.chatParticipant.create({
      data: { roomId: room.id, userId }
    });

    // Add all admins as participants
    const admins = await tx.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true }
    });

    for (const admin of admins) {
      await tx.chatParticipant.create({
        data: { roomId: room.id, userId: admin.id }
      });
    }

    return room;
  });

  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.chatRoom.delete({
    where: { id },
  });
  return result;
};

export const ChatRoomService = {
  create,
  getAll,
  getById,
  getMyRooms,
  getOrCreateSupportRoom,
  update,
  deleteById,
};
