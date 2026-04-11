import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../notification/notification.service.js';

const create = async (payload: any) => {
  const result = await prisma.orderIssue.create({
    data: payload,
    include: { order: true }
  });

  // Notify Admin
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) {
    await NotificationService.create({
      userId: admin.id,
      title: 'New Order Issue Reported',
      message: `A new issue has been reported for order ${result.order.orderNumber}.`,
      type: 'SYSTEM'
    });
  }

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["description"].map((field) => ({
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

  const whereConditions: Prisma.OrderIssueWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.orderIssue.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    include: { order: true, user: { select: { name: true, email: true } } }
  });
  const total = await prisma.orderIssue.count({ where: whereConditions });

  return {
    meta: { total, totalPage: Math.ceil(total / limit), page, limit },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.orderIssue.findUnique({
    where: { id },
    include: { order: true, user: true }
  });
  if (!result) throw new ApiError(404, 'Order issue not found');
  return result;
};

const updateStatus = async (id: string, status: any) => {
  const result = await prisma.orderIssue.update({
    where: { id },
    data: { status },
    include: { order: true }
  });

  // Notify User
  await NotificationService.create({
    userId: result.userId,
    title: 'Order Issue Updated',
    message: `Your issue regarding order ${result.order.orderNumber} has been updated to ${status}.`,
    type: 'SYSTEM'
  });

  return result;
};

export const OrderIssueService = {
  create,
  getAll,
  getById,
  updateStatus,
};
