
import httpStatus from "http-status";
import { ITicketCreatePayload, ITicketMessageCreatePayload } from "./chat.interface.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";

/* ================= CREATE TICKET ================= */
const createTicket = async (userId: string, payload: ITicketCreatePayload) => {
  return await prisma.supportTicket.create({
    data: { ...payload, userId },
  });
};

/* ================= GET MY TICKETS ================= */
const getMyTickets = async (userId: string) => {
  return await prisma.supportTicket.findMany({
    where: { userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      order: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET TICKET BY ID ================= */
const getTicketById = async (id: string) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      order: { select: { id: true, status: true } },
    },
  });
  if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  return ticket;
};

/* ================= SEND MESSAGE ================= */
const sendMessage = async (ticketId: string, senderId: string, payload: ITicketMessageCreatePayload) => {
  await getTicketById(ticketId);

  return await prisma.ticketMessage.create({
    data: { ticketId, senderId, content: payload.content },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });
};

/* ================= CLOSE TICKET ================= */
const closeTicket = async (userId: string, ticketId: string) => {
  const ticket = await getTicketById(ticketId);
  if (ticket.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  return await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "RESOLVED" } });
};

export const ChatService = {
  createTicket,
  getMyTickets,
  getTicketById,
  sendMessage,
  closeTicket,
};
