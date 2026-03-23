import { prisma } from "src/helpers.ts/prisma.js";
import ApiError from "src/errors/ApiError.js";
import httpStatus from "http-status";
import { UserStatus } from "@prisma/client";

/* ================= DASHBOARD STATS ================= */
const getDashboardStats = async () => {
  const [totalUsers, totalOrders, totalOperators, pendingOrders, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.operatorProfile.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  return {
    totalUsers,
    totalOrders,
    totalOperators,
    pendingOrders,
    totalRevenue: totalRevenue._sum.amount ?? 0,
  };
};

/* ================= GET ALL USERS ================= */
const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= UPDATE USER STATUS ================= */
const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return await prisma.user.update({ where: { id: userId }, data: { status } });
};

/* ================= GET ADMIN SETTINGS ================= */
const getAdminSettings = async () => {
  return await prisma.adminSetting.findUnique({ where: { id: "1" } });
};

/* ================= UPDATE ADMIN SETTINGS ================= */
const updateAdminSettings = async (payload: Record<string, unknown>) => {
  return await prisma.adminSetting.upsert({
    where: { id: "1" },
    update: payload,
    create: { id: "1", ...payload } as any,
  });
};

/* ================= GET ALL SUPPORT TICKETS ================= */
const getAllTickets = async () => {
  return await prisma.supportTicket.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, status: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= UPDATE TICKET STATUS ================= */
const updateTicketStatus = async (ticketId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  return await prisma.supportTicket.update({ where: { id: ticketId }, data: { status } });
};

export const AdminService = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAdminSettings,
  updateAdminSettings,
  getAllTickets,
  updateTicketStatus,
};
