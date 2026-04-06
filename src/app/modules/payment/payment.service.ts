import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { stripe } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';

const create = async (payload: any) => {
  const result = await prisma.payment.create({
    data: payload,
  });
  return result;
};

/**
 * Main Webhook Handler
 * Logs every event and delegates to specific handlers
 */
const handleWebhook = async (signature: string, payload: any) => {
  const secret = (config.stripe.stripe_webhook_secret as string || "").trim();
  console.log(`[STRIPE WEBHOOK] Incoming Request...`);
  console.log(`[STRIPE WEBHOOK] Secret Prefix: ${secret.slice(0, 7)}... (Length: ${secret.length})`);
  console.log(`[STRIPE WEBHOOK] Signature Present: ${!!signature}`);
  console.log(`[STRIPE WEBHOOK] Payload type: ${typeof payload}, Is Buffer: ${Buffer.isBuffer(payload)}`);

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
    // Common local error: whsec_ mismatch between CLI and .env
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
    console.error(error.stack);
  }

  return { received: true };
};

const handleCheckoutSessionCompleted = async (session: any) => {
  const metadata = session.metadata;
  console.log(`[STRIPE WEBHOOK] Metadata:`, JSON.stringify(metadata, null, 2));

  if (!metadata || !metadata.type) {
    console.warn(`[STRIPE WEBHOOK] Warning: No metadata type found in session ${session.id}`);
    return;
  }

  if (metadata.type === "USER_SUBSCRIPTION") {
    await handleUserSubscriptionSuccess(metadata.userId, session);
  } else if (metadata.type === "ORDER_PAYMENT") {
    if (!metadata.orderId) {
      console.error(`[STRIPE WEBHOOK ERROR] Missing orderId in metadata for ORDER_PAYMENT session ${session.id}`);
      return;
    }
    await handleOrderPaymentSuccess(metadata.orderId, session);
  } else if (metadata.type === "OPERATOR_AD_SUBSCRIPTION") {
    await handleAdSubscriptionSuccess(metadata.operatorId, metadata.planId, session);
  } else {
    console.warn(`[STRIPE WEBHOOK] Unknown metadata type: ${metadata.type}`);
  }
};

const handleUserSubscriptionSuccess = async (userId: string, session: any) => {
  const planId = session.metadata.planId;
  console.log(`[STRIPE WEBHOOK] Activating Premium for User: ${userId}, Plan: ${planId}`);

  // Check if already processed
  const existingSub = await prisma.userSubscription.findFirst({
    where: { stripePaymentId: session.subscription as string },
  });

  if (existingSub) {
    console.log(`[STRIPE WEBHOOK] Subscription ${session.subscription} already activated for user ${userId}. Skipping.`);
    return;
  }

  const plan = await prisma.userSubscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan) {
    console.error(`[STRIPE WEBHOOK ERROR] Plan ${planId} not found for User Subscription.`);
    return;
  }

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

  console.log(`[STRIPE WEBHOOK] User ${userId} is now Premium until ${endDate.toDateString()}.`);
};

const handleOrderPaymentSuccess = async (orderId: string, session: any) => {
  console.log(`[STRIPE WEBHOOK] handleOrderPaymentSuccess started for Order: ${orderId}, Session: ${session.id}`);

  // 1. Find the payment record created during order creation
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeSessionId: session.id },
  });

  console.log(`[STRIPE WEBHOOK] Existing Payment Found: ${existingPayment ? existingPayment.id : 'NO'}`);

  if (existingPayment && existingPayment.status === "PAID") {
    console.log(`[STRIPE WEBHOOK] Payment ${session.id} already processed. Skipping.`);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { include: { operator: true } } },
  });

  if (!order) {
    console.error(`[STRIPE WEBHOOK ERROR] Order ${orderId} not found in DB!`);
    return;
  }

  console.log(`[STRIPE WEBHOOK] Order Found: ${order.orderNumber}. Processing updates...`);

  // Use the pre-calculated fees from the order record to ensure accuracy
  const platformFee = Number(order.platformFee);
  const operatorAmount = Number(order.operatorAmount);

  await prisma.$transaction(async (tx) => {
    // 1. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "READY_FOR_DELIVERY",
        stripeSessionId: session.id, // Keep track on order too
      },
    });

    // 2. Update or Create Payment record
    let payment;
    if (existingPayment) {
      payment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          stripePaymentIntentId: session.payment_intent as string,
          status: "PAID",
          paidAt: new Date(),
        },
      });
    } else {
      payment = await tx.payment.create({
        data: {
          orderId,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: order.totalAmount,
          platformFee: platformFee,
          operatorAmount: operatorAmount,
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }

    // 3. Update Admin Wallet
    const admin = await tx.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    if (admin) {
      const adminWallet = await tx.adminWallet.upsert({
        where: { userId: admin.id },
        update: { balance: { increment: platformFee } },
        create: { userId: admin.id, balance: platformFee },
      });

      await tx.adminWalletTransaction.create({
        data: {
          walletId: adminWallet.id,
          amount: platformFee,
          transactionType: "PLATFORM_COMMISSION",
          orderId,
          note: `Platform fee for order ${order.orderNumber}. (Payment: ${payment.id})`,
        },
      });
    }

    // 4. Update Operator Wallet
    const operatorId = order.store.operator.id;
    const operatorWallet = await tx.operatorWallet.upsert({
      where: { operatorId },
      update: { balance: { increment: operatorAmount } },
      create: { operatorId, balance: operatorAmount },
    });

    await tx.operatorWalletTransaction.create({
      data: {
        walletId: operatorWallet.id,
        amount: operatorAmount,
        transactionType: "ORDER_REVENUE",
        orderId,
        note: `Revenue for order ${order.orderNumber}. (Payment: ${payment.id})`,
      },
    });
  });

  console.log(`[STRIPE WEBHOOK] Order ${orderId} fully processed. Admin: +$${platformFee}, Operator: +$${operatorAmount}`);
};

const handleAdSubscriptionSuccess = async (operatorId: string, planId: string, session: any) => {
  console.log(`[STRIPE WEBHOOK] Activating Ad Subscription for Operator: ${operatorId}, Plan: ${planId}`);

  // Check if processed
  const existingSub = await prisma.adSubscription.findFirst({
    where: { stripePaymentId: session.id },
  });

  if (existingSub) {
    console.log(`[STRIPE WEBHOOK] Ad Subscription ${session.id} already processed. Skipping.`);
    return;
  }

  const plan = await prisma.adSubscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error(`[STRIPE WEBHOOK ERROR] Ad Plan ${planId} not found.`);
    return;
  }

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

  console.log(`[STRIPE WEBHOOK] Ad Subscription activated for Operator ${operatorId} until ${endDate.toDateString()}.`);
};

const handleSubscriptionDeleted = async (subscription: any) => {
  console.log(`[STRIPE WEBHOOK] Subscription Deleted: ${subscription.id}`);
  // Handle downgrading user premium status
  const userSub = await prisma.userSubscription.findFirst({
    where: { stripePaymentId: subscription.id }
  });
  if (userSub) {
    await prisma.userSubscription.update({
      where: { id: userSub.id },
      data: { status: "EXPIRED" }
    });
    await prisma.user.update({
      where: { id: userSub.userId },
      data: { isSubscribed: false }
    });
    console.log(`[STRIPE WEBHOOK] User ${userSub.userId} is no longer Premium.`);
  }
};

const handleSubscriptionUpdated = async (subscription: any) => {
  console.log(`[STRIPE WEBHOOK] Subscription Updated: ${subscription.id} [Status: ${subscription.status}]`);
  // Handle status sync if necessary
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["stripeSessionId", "stripePaymentIntentId"].map((field) => ({
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

  const whereConditions: Prisma.PaymentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.payment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
  });
  const total = await prisma.payment.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.payment.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Payment not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.payment.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.payment.delete({
    where: { id },
  });
  return result;
};

export const PaymentService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  handleWebhook,
};
