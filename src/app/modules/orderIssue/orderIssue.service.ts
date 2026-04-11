import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../notification/notification.service.js';
import { RefundService } from '../refund/refund.service.js';

const create = async (payload: any) => {
  const { orderId, userId } = payload;

  console.log(payload);

  // Verify order belongs to user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { operatorOrders: true }
  });

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== userId) throw new ApiError(403, 'Unauthorized');

  // Auto-assign first operator if not provided
  if (!payload.operatorId && order.operatorOrders.length > 0) {
    payload.operatorId = order.operatorOrders[0].operatorId;
  }

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

  // Notify Operator
  if (payload.operatorId) {
    const operator = await prisma.operator.findUnique({
      where: { id: payload.operatorId },
      include: { user: true }
    });
    if (operator) {
      await NotificationService.create({
        userId: operator.userId,
        title: 'New Issue on Your Order',
        message: `An issue has been reported for order ${result.order.orderNumber}.`,
        type: 'SYSTEM'
      });
    }
  }

  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, operatorId, userId, ...filterData } = filters;

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

  if (operatorId) {
    andConditions.push({
      operatorId: {
        equals: operatorId,
      },
    });
  }

  if (userId) {
    andConditions.push({
      userId: {
        equals: userId,
      },
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

const respondToIssue = async (id: string, operatorId: string, payload: { action?: 'REFUND' | 'ESCALATE', amount?: number, note?: string, status?: string, operatorNote?: string, refundAmount?: number }) => {
  const issue = await prisma.orderIssue.findUnique({
    where: { id },
    include: { order: true }
  });

  if (!issue) throw new ApiError(404, 'Order issue not found');
  if (issue.operatorId !== operatorId) throw new ApiError(403, 'Unauthorized');
  if (issue.isEscalated) throw new ApiError(400, 'This issue has been escalated and cannot be modified by the operator.');

  // Normalize payload for internal use
  const action = payload.action || (payload.status === 'REFUNDED' ? 'REFUND' : (payload.status === 'ESCALATED' ? 'ESCALATE' : undefined));
  const amount = payload.amount || payload.refundAmount;
  const note = payload.note || payload.operatorNote;

  if (action === 'ESCALATE') {
    const result = await prisma.orderIssue.update({
      where: { id },
      data: {
        status: 'ESCALATED',
        isEscalated: true,
        escalationNote: note
      }
    });

    // Notify Admin
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (admin) {
      await NotificationService.create({
        userId: admin.id,
        title: 'Issue Escalated to Admin',
        message: `An issue for order ${issue.order.orderNumber} has been escalated.`,
        type: 'SYSTEM'
      });
    }
    return result;
  }

  if (action === 'REFUND') {
    if (!amount) throw new ApiError(400, 'Refund amount is required');

    return await prisma.$transaction(async (tx) => {
      // 1. Create Refund Request via RefundService
      const refund = await RefundService.requestRefund(issue.userId, {
        orderId: issue.orderId,
        operatorId: operatorId,
        amount: amount!,
        reason: issue.description
      });

      // 2. Process/Approve the refund immediately (Operator initiated)
      await RefundService.processRefundByOperator(operatorId, refund.id, 'APPROVE');

      // 3. Update Issue Status
      const updatedIssue = await tx.orderIssue.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          refundAmount: amount,
          operatorNote: note
        }
      });

      return updatedIssue;
    });
  }

  // Handle direct updates for other statuses (e.g., RESOLVED)
  if (payload.status || payload.operatorNote || payload.refundAmount) {
     return await prisma.orderIssue.update({
       where: { id },
       data: {
         status: (payload.status as any) || issue.status,
         operatorNote: note || issue.operatorNote,
         refundAmount: amount || issue.refundAmount
       }
     });
  }

  throw new ApiError(400, 'No valid action or update data provided');
};

const resolveEscalatedIssue = async (id: string, adminId: string, payload: { action?: 'REFUND' | 'PARTIAL_REFUND' | 'SOLVE', amount?: number, note?: string, status?: string, adminNote?: string, refundAmount?: number }) => {
  const issue = await prisma.orderIssue.findUnique({
    where: { id },
    include: { order: true }
  });

  if (!issue) throw new ApiError(404, 'Order issue not found');
  if (!issue.isEscalated) throw new ApiError(400, 'Issue is not escalated to admin.');

  // Normalize payload
  const action = payload.action || (payload.status === 'REFUNDED' ? 'REFUND' : (payload.status === 'RESOLVED' ? 'SOLVE' : undefined));
  const amount = payload.amount || payload.refundAmount;
  const note = payload.note || payload.adminNote;

  if (action === 'SOLVE') {
    return await prisma.orderIssue.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        adminNote: note
      }
    });
  }

  if (action === 'REFUND' || action === 'PARTIAL_REFUND') {
    if (!amount) throw new ApiError(400, 'Refund amount is required');

    return await prisma.$transaction(async (tx) => {
      // 1. Create Refund Request
      const refund = await RefundService.requestRefund(issue.userId, {
        orderId: issue.orderId,
        operatorId: issue.operatorId!,
        amount: amount!,
        reason: `Admin Resolved: ${issue.description}`
      });

      // 2. Process by Admin
      await RefundService.processRefundByAdmin(adminId, refund.id, 'APPROVE', action === 'PARTIAL_REFUND' ? amount : undefined);

      // 3. Update Issue
      return await tx.orderIssue.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          refundAmount: amount,
          adminNote: note
        }
      });
    });
  }

  // Fallback direct update
  if (payload.status || payload.adminNote || payload.refundAmount) {
     return await prisma.orderIssue.update({
       where: { id },
       data: {
         status: (payload.status as any) || issue.status,
         adminNote: note || issue.adminNote,
         refundAmount: amount || issue.refundAmount
       }
     });
  }

  throw new ApiError(400, 'No valid action or update data provided');
};

export const OrderIssueService = {
  create,
  getAll,
  getById,
  respondToIssue,
  resolveEscalatedIssue,
};
