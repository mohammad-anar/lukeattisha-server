import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';

const create = async (payload: any) => {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the support ticket
    const ticket = await tx.supportTicket.create({
      data: payload,
    });

    // 2. Create a ChatRoom linked to this ticket
    const chatRoom = await tx.chatRoom.create({
      data: {
        name: `Support - ${ticket.ticketNumber}`,
        ticketId: ticket.id,
      },
    });

    // 3. Add the ticket creator as a participant
    await tx.chatParticipant.create({
      data: {
        roomId: chatRoom.id,
        userId: ticket.userId,
      },
    });

    return { ...ticket, chatRoom };
  });

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["ticketNumber", "subject", "description"].map((field) => ({
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

  const whereConditions: Prisma.SupportTicketWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.supportTicket.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.supportTicket.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.supportTicket.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'SupportTicket not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.supportTicket.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);

  const result = await prisma.supportTicket.delete({
    where: { id },
  });
  // delete room and participants
  await prisma.chatRoom.deleteMany({
    where: { ticketId: id },
  });
  await prisma.chatParticipant.deleteMany({
    where: { roomId: id },
  });
  return result;
};

export const SupportTicketService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
