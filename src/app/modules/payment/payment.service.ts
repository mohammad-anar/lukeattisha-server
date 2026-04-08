import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers, stripe } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';

const create = async (payload: any) => {
  const result = await prisma.payment.create({
    data: payload,
  });
  return result;
};

/**
 * Main Webhook Handler
 */
const handleWebhook = async (signature: string, payload: any) => {
  const secret = (config.stripe.stripe_webhook_secret as string || "").trim();
  console.log(`[STRIPE WEBHOOK] Incoming Request...`);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
    console.log(`[STRIPE WEBHOOK] ✅ Verification SUCCESS: ${event.type}`);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK ❌ ERROR] Verification Failed: ${err.message}`);
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log(`[STRIPE WEBHOOK] Handling checkout.session.completed for ${session.id}`);
        await handleCheckoutSessionCompleted(session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(session);
        break;
      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK ERROR] Processing Failed [Type: ${event.type}]:`, error.message);
  }

  return { received: true };
};

const handleCheckoutSessionCompleted = async (session: any) => {
  const metadata = session.metadata;
  if (!metadata || !metadata.type) {
    console.warn(`[STRIPE WEBHOOK] Warning: No metadata type found in session ${session.id}`);
    return;
  }

  if (metadata.type === "USER_SUBSCRIPTION") {
    await handleUserSubscriptionSuccess(metadata.userId, session);
  } else if (metadata.type === "ORDER_PAYMENT") {
    await handleMultiVendorOrderPaymentSuccess(metadata.orderId, session);
  } else if (metadata.type === "OPERATOR_AD_SUBSCRIPTION") {
    await handleAdSubscriptionSuccess(metadata.operatorId, metadata.planId, session);
  }
};

const handleUserSubscriptionSuccess = async (userId: string, session: any) => {
  const planId = session.metadata.planId;
  const existingSub = await prisma.userSubscription.findFirst({
    where: { stripePaymentId: session.subscription as string },
  });
  if (existingSub) return;

  const plan = await prisma.userSubscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonth);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isSubscribed: true },
    });
    await tx.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        startDate,
        endDate,
        status: "ACTIVE",
        stripePaymentId: session.subscription as string,
      },
    });
  });
};

const handleMultiVendorOrderPaymentSuccess = async (orderId: string, session: any) => {
  console.log(`[STRIPE WEBHOOK] Multi-vendor payment success for Order: ${orderId}`);

  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          operatorOrders: { include: { operator: true } },
        },
      },
    },
  });

  if (!payment || payment.status === "PAID") return;

  const { order } = payment;

  // 1. Mark order and payment as paid
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', status: 'PENDING' },
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string
      },
    }),
  ]);

  // 2. Platform Revenue (Admin Wallet)
  // The Admin should get the platformFee (commission)
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (admin) {
    const adminWallet = await prisma.adminWallet.upsert({
      where: { userId: admin.id },
      update: { balance: { increment: order.platformFee } },
      create: { userId: admin.id, balance: order.platformFee },
    });

    await prisma.adminWalletTransaction.create({
      data: {
        walletId: adminWallet.id,
        amount: order.platformFee,
        type: "PLATFORM_COMMISSION",
        orderId: order.id,
        note: `Platform commission for multi-vendor order ${order.orderNumber}`,
      },
    });

    // 3. Subscription Fee Handling (If subscription, admin absorbs delivery fee)
    // The admin wallet gets the commission, but must pay the operator the delivery fee
    if (order.isSubscription) {
      const actualDeliveryFee = Number((order as any).actualPickupAndDeliveryFee);
      if (actualDeliveryFee > 0) {
        await prisma.adminWallet.update({
          where: { id: adminWallet.id },
          data: { balance: { decrement: actualDeliveryFee } }
        });
        await prisma.adminWalletTransaction.create({
          data: {
            walletId: adminWallet.id,
            amount: actualDeliveryFee,
            type: "DEBIT",
            orderId: order.id,
            note: `Subscription delivery fee absorbed for order ${order.orderNumber}`,
          },
        });
        console.log(`[STRIPE WEBHOOK] Admin Wallet DEBITED for subscription delivery: $${actualDeliveryFee}`);
      }
    }
  }

  // 4. Create transfers to each operator
  for (const operatorOrder of order.operatorOrders) {
    const operator = operatorOrder.operator;

    if (!operator.stripeAccountId) {
      console.error(`[STRIPE WEBHOOK] Transfer SKIPPED: Operator ${operator.id} has no Stripe ID.`);
      continue;
    }

    try {
      const transfer = await StripeHelpers.createTransfer(
        Math.round(Number(operatorOrder.transferAmount) * 100),
        operator.stripeAccountId,
        order.stripeTransferGroup!,
        {
          orderId: order.id,
          operatorOrderId: operatorOrder.id,
          operatorId: operator.id,
        }
      );

      await prisma.$transaction(async (tx) => {
        await tx.operatorOrder.update({
          where: { id: operatorOrder.id },
          data: { transferStatus: 'COMPLETED', stripeTransferId: transfer.id },
        });

        await tx.transfer.create({
          data: {
            paymentId: payment.id,
            operatorId: operator.id,
            stripeConnectedAccId: operator.stripeAccountId!,
            amount: operatorOrder.transferAmount,
            stripeTransferId: transfer.id,
            status: 'COMPLETED',
          },
        });

        const wallet = await tx.operatorWallet.upsert({
          where: { operatorId: operator.id },
          update: { balance: { increment: operatorOrder.transferAmount } },
          create: { operatorId: operator.id, balance: operatorOrder.transferAmount },
        });

        await tx.operatorWalletTransaction.create({
          data: {
            walletId: wallet.id,
            operatorId: operator.id,
            orderId: order.id,
            amount: operatorOrder.transferAmount,
            type: 'ORDER_REVENUE',
            note: `Revenue for multi-vendor order ${order.orderNumber}`,
          },
        });
      });
      console.log(`[STRIPE WEBHOOK] Transfer SUCCESS: $${operatorOrder.transferAmount} to operator ${operator.id}`);
    } catch (err: any) {
      console.error(`[STRIPE WEBHOOK ❌ ERROR] Transfer failed for operator ${operator.id}:`, err.message);
      await prisma.operatorOrder.update({
        where: { id: operatorOrder.id },
        data: { transferStatus: 'FAILED' },
      });
    }
  }
};

const handleAdSubscriptionSuccess = async (operatorId: string, planId: string, session: any) => {
  const existingSub = await prisma.adSubscription.findFirst({
    where: { stripePaymentId: session.id },
  });
  if (existingSub) return;

  const plan = await prisma.adSubscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonth);

  await prisma.adSubscription.create({
    data: {
      operatorId,
      planId,
      startDate,
      endDate,
      status: "ACTIVE",
      stripePaymentId: session.id,
    },
  });
};

const handleSubscriptionDeleted = async (subscription: any) => {
  const userSub = await prisma.userSubscription.findFirst({
    where: { stripePaymentId: subscription.id }
  });
  if (userSub) {
    await prisma.$transaction([
      prisma.userSubscription.update({
        where: { id: userSub.id },
        data: { status: "EXPIRED" }
      }),
      prisma.user.update({
        where: { id: userSub.userId },
        data: { isSubscribed: false }
      })
    ]);
  }
};

const handleSubscriptionUpdated = async (subscription: any) => {
  // Logic for status sync if needed
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const result = await prisma.payment.findMany({
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
  });
  const total = await prisma.payment.count();
  return { meta: { total, page, limit }, data: result };
};

const getById = async (id: string) => {
  const result = await prisma.payment.findUnique({ where: { id }, include: { transfers: true, order: true } });
  if (!result) throw new ApiError(404, 'Payment not found');
  return result;
};

const update = async (id: string, payload: any) => {
  return await prisma.payment.update({ where: { id }, data: payload });
};

const deleteById = async (id: string) => {
  return await prisma.payment.delete({ where: { id } });
};

export const PaymentService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  handleWebhook,
};
