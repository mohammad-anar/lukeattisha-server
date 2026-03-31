import httpStatus from "http-status";
import { Prisma, UserStatus } from "@prisma/client";
import { prisma } from "../../../helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";
import { IPaginationOptions, IUserFilterRequest } from "types/pagination.js";
import { paginationHelper } from "helpers.ts/paginationHelper.js";

/* ================= DASHBOARD STATS ================= */
const getDashboardStats = async () => {
  const [totalUsers, totalOrders, totalOperators, pendingOrders, totalRevenue] =
    await Promise.all([
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
const getAllUsers = async (
  filter: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;

  const conditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name", "email", "phone"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  conditions.push({ role: { not: "ADMIN" } });
  conditions.push({ isDeleted: false });

  const where = { AND: conditions };

  const data = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      userAddresses: true,
      paymentCards: true,
      orders: true,
      reviews: true,
      _count: true,
    },
  });

  const total = await prisma.user.count({ where });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data,
  };
};

/* ================= UPDATE USER STATUS ================= */
const updateUserStatus = async (userId: string, status: UserStatus) => {
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return await prisma.user.update({ where: { id: userId }, data: { status } });
};

/* ================= CREATE ADMIN SETTINGS ================= */
const createAdminSettings = async (payload: Prisma.AdminSettingCreateInput) => {
  const existing = await prisma.adminSetting.findUnique({ where: { id: "1" } });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Admin settings already exist. Use the update endpoint instead.");
  }
  return await prisma.adminSetting.create({
    data: { id: "1", ...payload } as any,
  });
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
const updateTicketStatus = async (
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  return await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });
};

export const AdminService = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  createAdminSettings,
  getAdminSettings,
  updateAdminSettings,
  getAllTickets,
  updateTicketStatus,
};
