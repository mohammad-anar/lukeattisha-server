import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { RefundStatus, TransactionType } from '@prisma/client';

const requestRefund = async (userId: string, payload: { orderId: string, operatorId: string, amount: number, reason: string }) => {
  const { orderId, operatorId, amount, reason } = payload;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true }
  });

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== userId) throw new ApiError(403, 'You are not authorized to request a refund for this order');
  if (order.paymentStatus !== 'PAID') throw new ApiError(400, 'Only paid orders can be refunded');

  const refund = await prisma.refund.create({
    data: {
      orderId,
      operatorId,
      amount,
      reason,
      status: 'PENDING'
    }
  });

  return refund;
};

const processRefundByOperator = async (operatorId: string, refundId: string, action: 'APPROVE' | 'REJECT' | 'ESCALATE') => {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { order: true }
  });

  if (!refund) throw new ApiError(404, 'Refund request not found');
  if (refund.operatorId !== operatorId) throw new ApiError(403, 'Unauthorized');

  if (action === 'REJECT') {
    return await prisma.refund.update({
      where: { id: refundId },
      data: { status: 'REJECTED' }
    });
  }

  if (action === 'ESCALATE') {
    return await prisma.refund.update({
      where: { id: refundId },
      data: { status: 'ESCALATED', isEscalated: true }
    });
  }

  if (action === 'APPROVE') {
    return await prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: { status: 'APPROVED' }
      });

      await tx.order.update({
        where: { id: updatedRefund.orderId },
        data: { paymentStatus: 'REFUNDED' }
      });

      await updateWalletsOnRefund(tx, updatedRefund);
      return updatedRefund;
    });
  }
};

const processRefundByAdmin = async (adminId: string, refundId: string, action: 'APPROVE' | 'REJECT', partialAmount?: number) => {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { order: true }
  });

  if (!refund) throw new ApiError(404, 'Refund request not found');
  if (!refund.isEscalated) throw new ApiError(400, 'This refund is not escalated to admin yet');

  if (action === 'REJECT') {
    return await prisma.refund.update({
      where: { id: refundId },
      data: { status: 'REJECTED' }
    });
  }

  if (action === 'APPROVE') {
    return await prisma.$transaction(async (tx) => {
      const finalAmount = partialAmount || refund.amount;
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: { 
          status: partialAmount ? 'PARTIALLY_REFUNDED' : 'APPROVED',
          amount: finalAmount 
        }
      });

      await tx.order.update({
        where: { id: updatedRefund.orderId },
        data: { paymentStatus: partialAmount ? 'PAID' : 'REFUNDED' } // If partial, it stays PAID but record shows refund
      });

      await updateWalletsOnRefund(tx, updatedRefund);
      return updatedRefund;
    });
  }
};

const updateWalletsOnRefund = async (tx: any, refund: any) => {
  const { orderId, operatorId, amount } = refund;
  const order = await tx.order.findUnique({
    where: { id: orderId }
  });

  // Calculate proportional reversing of commission
  // totalAmount = subtotal + platformFee + pickupAndDeliveryFee + fixedFee
  // platformFee is what admin keeps.
  // We need to know the ratio of refund amount to the subtotal or total.
  // If the admin accepts a partial refund, we should probably reverse the proportional commission.

  const refundRatio = Number(amount) / Number(order.totalAmount);
  const platformFeeReversal = Number(order.platformFee) * refundRatio;
  const operatorAmountReversal = Number(amount) - platformFeeReversal;

  // 1. Update Operator Wallet
  const operatorWallet = await tx.operatorWallet.findUnique({ where: { operatorId } });
  if (operatorWallet) {
    await tx.operatorWallet.update({
      where: { id: operatorWallet.id },
      data: { balance: { decrement: operatorAmountReversal } }
    });

    await tx.operatorWalletTransaction.create({
      data: {
        walletId: operatorWallet.id,
        operatorId,
        orderId,
        refundId: refund.id,
        amount: operatorAmountReversal,
        type: 'REFUND',
        note: `Refund for order ${order.orderNumber}`
      }
    });
  }

  // 2. Update Admin Wallet
  const admin = await tx.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) {
    const adminWallet = await tx.adminWallet.findUnique({ where: { userId: admin.id } });
    if (adminWallet) {
      await tx.adminWallet.update({
        where: { id: adminWallet.id },
        data: { balance: { decrement: platformFeeReversal } }
      });

      await tx.adminWalletTransaction.create({
        data: {
          walletId: adminWallet.id,
          orderId,
          refundId: refund.id,
          amount: platformFeeReversal,
          type: 'REFUND',
          note: `Refund reversal for order ${order.orderNumber}`
        }
      });
    }
  }
};

export const RefundService = {
  requestRefund,
  processRefundByOperator,
  processRefundByAdmin
};
