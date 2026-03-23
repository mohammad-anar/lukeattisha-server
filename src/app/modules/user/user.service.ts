import { prisma } from "src/helpers.ts/prisma.js";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { IPaginationOptions, IUserFilterRequest } from "src/types/pagination.js";
import { Prisma } from "@prisma/client";

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

/* ================= GET USER BY ID ================= */
const getUserById = async (id: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      userAddresses: true,
      paymentCards: true,
      orders: true,
      reviews: true,
      _count: true,
    },
  });
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
