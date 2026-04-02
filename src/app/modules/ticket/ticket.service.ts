import { prisma } from "../../../helpers.ts/prisma.js";
import { generateCustomId } from "../../../helpers.ts/idGenerator.js";


/* ================= CREATE TICKET ================= */
const createTicket = async (userId: string, payload: any) => {
  const customTicketId = await generateCustomId('TICKET');
  return await prisma.supportTicket.create({
    data: {
      ticketId: customTicketId,
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


/* ================= DELETE TICKET ================= */
const deleteTicket = async (id: string) => {
  return await prisma.supportTicket.delete({
    where: { id },
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
  deleteTicket,
  addMessage,
};
