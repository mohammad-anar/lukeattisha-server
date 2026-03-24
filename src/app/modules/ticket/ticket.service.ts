import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ================= CREATE TICKET ================= */
const createTicket = async (userId: string, payload: any) => {
  return await prisma.supportTicket.create({
    data: {
      userId,
      ...payload,
    },
  });
};

/* ================= GET MY TICKETS ================= */
const getMyTickets = async (userId: string) => {
  return await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { messages: true },
  });
};

/* ================= GET ALL TICKETS ================= */
const getAllTickets = async () => {
  return await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, messages: true },
  });
};

/* ================= GET SINGLE TICKET ================= */
const getSingleTicket = async (id: string) => {
  return await prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: true, user: true },
  });
};

/* ================= UPDATE TICKET ================= */
const updateTicket = async (id: string, payload: any) => {
  return await prisma.supportTicket.update({
    where: { id },
    data: payload,
  });
};

/* ================= ADD MESSAGE ================= */
const addMessage = async (ticketId: string, senderId: string, content: string) => {
  return await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId,
      content,
    },
  });
};

export const TicketService = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  addMessage,
};
