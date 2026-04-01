
import { Prisma } from "@prisma/client";
import { paginationHelper } from "helpers.ts/paginationHelper.js";
import { prisma } from "helpers.ts/prisma.js";
import { IPaginationOptions, IUserFilterRequest } from "types/pagination.js";

/* ================= GET ME ================= */
const getMe = async (email: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar:true,
      status: true,
      isVerified: true,
      userAddresses: true,
      orders: true,
      reviews: true,
      _count: true,
    },
  });
};

/* ================= GET ALL USERS ================= */
const getAllUsers = async (filter: IUserFilterRequest, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minspent, isVerified, ...filterData } = filter;
  const conditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name", "email", "phone"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (minspent && Number(minspent) > 0) {
    const ordersWithSum = await prisma.order.groupBy({
      by: ["userId"],
      _sum: { total: true },
      having: {
        total: {
          _sum: {
            gte: Number(minspent),
          },
        },
      },
    });

    const userIds = ordersWithSum.map((s) => s.userId);
    conditions.push({ id: { in: userIds } });
  }

  if (isVerified) {
    conditions.push({ isVerified: isVerified === "true" });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  conditions.push({ role: "USER"});
  conditions.push({ isDeleted: false });

  const where = { AND: conditions };

  const data = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userID: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      status: true,
      isVerified: true,
      createdAt: true,
      userAddresses: true,
      paymentCards: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
  });

  const total = await prisma.user.count({ where });

  // Separate query for order statistics to avoid heavy joins
  const userIds = data.map((u) => u.id);
  const orderStats = await prisma.order.groupBy({
    by: ["userId"],
    _sum: { total: true },
    _count: { id: true },
    where: { userId: { in: userIds } },
  });

  const statsMap = orderStats.reduce((acc: any, stat: any) => {
    const totalPaymentAmount = Number(stat._sum.total) || 0;
    const totalOrders = stat._count.id || 0;
    acc[stat.userId] = {
      totalPaymentAmount,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalPaymentAmount / totalOrders : 0,
    };
    return acc;
  }, {});

  const enrichedData = data.map((user) => ({
    ...user,
    ...(statsMap[user.id] || {
      totalPaymentAmount: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    }),
  }));

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: enrichedData,
  };
};

/* ================= GET USER BY ID ================= */
const getUserById = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      userID: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      userAddresses: true,
      paymentCards: true,
      createdAt:true,
      updatedAt:true,
      reviews: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
  });

  // Calculate stats for a single user
  const orderStats = await prisma.order.aggregate({
    where: { userId: id },
    _sum: { total: true },
    _count: { id: true },
  });

  const totalPaymentAmount = Number(orderStats._sum.total) || 0;
  const totalOrders = orderStats._count.id || 0;

  return {
    ...user,
    totalPaymentAmount,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalPaymentAmount / totalOrders : 0,
  };
};

/* ================= UPDATE USER ================= */
const updateUser = async (id: string, payload: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data: payload });
};

/* ================= DELETE (SOFT) ================= */
const deleteUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { isDeleted: true, status: "INACTIVE" },
  });
};

export const UserService = {
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
