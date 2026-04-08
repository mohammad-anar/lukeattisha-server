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
  console.log(`[STRIPE WEBHOOK] Incoming Request at ${new Date().toISOString()}`);
  console.log(`[STRIPE WEBHOOK] SIGNATURE: ${signature?.substring(0, 20)}...`);
  console.log(`[STRIPE WEBHOOK] USING SECRET: ${secret.substring(0, 10)}...${secret.slice(-4)}`);
  
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
        console.log(`[STRIPE WEBHOOK] ✅ checkout.session.completed for session ${session.id}`);
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
  const metadata = session.metadata || {};
  if (!metadata.type) {
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
  console.log(`[STRIPE WEBHOOK 📦] SUCCESS HANDLER START for Order: ${orderId}`);
  console.log(`[STRIPE WEBHOOK 📦] Metadata Check: type=${session.metadata?.type}, orderId=${session.metadata?.orderId}`);
  
  // 1. Fetch the Order and attached Payment
  let payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          operatorOrders: { include: { operator: true } },
        },
      },
    },
  });

  if (payment) {
    console.log(`[STRIPE WEBHOOK 📦] Payment found. Current status: ${payment.status}`);
  } else {
    console.warn(`[STRIPE WEBHOOK 📦 ⚠️] Payment record MISSING for Order ${orderId}. Recovery triggered.`);
  }

  // If payment record is missing (e.g. manually deleted), fetch order directly
  if (!payment) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { operatorOrders: { include: { operator: true } } }
    });

    if (!order) {
        console.error(`[STRIPE WEBHOOK 📦 ❌ ERROR] Order ${orderId} NOT FOUND in DB. Recovery failed.`);
        return;
    }
    console.log(`[STRIPE WEBHOOK 📦] Order ${order.orderNumber} found. Creating missing payment record...`);

    // Create the missing payment record
    payment = await prisma.payment.create({
        data: {
            orderId: order.id,
            amount: order.totalAmount,
            stripePaymentIntentId: session.payment_intent as string || session.id,
            stripeTransferGroup: order.stripeTransferGroup || `TG-${order.orderNumber}`,
            status: 'UNPAID',
            paymentUrl: (session as any).url || ""
        },
        include: {
            order: {
                include: {
                    operatorOrders: { include: { operator: true } },
                },
            },
        }
    }) as any;
  }

  if (payment!.status === "PAID") {
    console.log(`[STRIPE WEBHOOK 📦 ℹ️] Order ${orderId} is ALREADY PAID. Skipping.`);
    return;
  }

  const order = payment!.order;
  console.log(`[STRIPE WEBHOOK 📦] 💥 STARTING DB UPDATE for Order: ${order.orderNumber} ($${order.totalAmount})`);

  try {
    await prisma.$transaction(async (tx) => {
      console.log(`[STRIPE WEBHOOK] ⛓️ Starting Transaction for Order: ${order.orderNumber}`);

      // 1. Mark Order & Payment as PAID
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'PENDING' },
      });

      await tx.payment.update({
        where: { id: payment!.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string || session.id
        },
      });

      // 2. Platform Revenue (Admin Wallet)
      const admin = await tx.user.findFirst({ where: { role: "SUPER_ADMIN" } });
      if (admin) {
        const adminWallet = await tx.adminWallet.upsert({
          where: { userId: admin.id },
          update: { balance: { increment: order.platformFee } },
          create: { userId: admin.id, balance: order.platformFee },
        });

        await tx.adminWalletTransaction.create({
          data: {
            walletId: adminWallet.id,
            amount: order.platformFee,
            type: "PLATFORM_COMMISSION",
            orderId: order.id,
            note: `Commission for order: ${order.orderNumber}`,
          },
        });

        // 3. Subscription Handling: Admin absorbs delivery fee
        if (order.isSubscription) {
          const actualDeliveryFee = Number((order as any).actualPickupAndDeliveryFee || 0);
          if (actualDeliveryFee > 0) {
            await tx.adminWallet.update({
              where: { id: adminWallet.id },
              data: { balance: { decrement: actualDeliveryFee } }
            });
            await tx.adminWalletTransaction.create({
              data: {
                walletId: adminWallet.id,
                amount: actualDeliveryFee,
                type: "DEBIT",
                orderId: order.id,
                note: `Subscription delivery fee absorbed for order ${order.orderNumber}`,
              },
            });
            console.log(`[STRIPE WEBHOOK] 🎁 Subscription: Admin absorbed $${actualDeliveryFee} delivery fee`);
          }
        }
      }

      // 4. Operator Revenue (Internal Wallets)
      for (const opOrder of order.operatorOrders) {
        const opWallet = await tx.operatorWallet.upsert({
          where: { operatorId: opOrder.operatorId },
          create: { operatorId: opOrder.operatorId, balance: opOrder.transferAmount },
          update: { balance: { increment: opOrder.transferAmount } },
        });

        await tx.operatorWalletTransaction.create({
          data: {
            walletId: opWallet.id,
            amount: opOrder.transferAmount,
            type: "ORDER_REVENUE",
            orderId: order.id,
            operatorId: opOrder.operatorId,
            note: `Revenue for order: ${order.orderNumber}`,
          },
        });
      }
    });

    console.log(`[STRIPE WEBHOOK] ✅ Database updates SUCCESS for Order: ${order.orderNumber}`);

    // 5. External Stripe Transfers (Outside DB transaction)
    for (const opOrder of order.operatorOrders) {
      const operator = opOrder.operator;
      if (!operator.stripeAccountId) {
        console.warn(`[STRIPE WEBHOOK] Transfer SKIPPED: Operator ${operator.id} has no Stripe ID.`);
        continue;
      }

      try {
        const stripeTransfer = await StripeHelpers.createTransfer(
          Math.round(Number(opOrder.transferAmount) * 100),
          operator.stripeAccountId,
          order.stripeTransferGroup!,
          { orderId: order.id, operatorOrderId: opOrder.id }
        );

        await prisma.operatorOrder.update({
          where: { id: opOrder.id },
          data: { transferStatus: 'COMPLETED', stripeTransferId: stripeTransfer.id },
        });

        await prisma.transfer.create({
          data: {
            paymentId: payment!.id,
            operatorId: operator.id,
            stripeConnectedAccId: operator.stripeAccountId,
            amount: opOrder.transferAmount,
            stripeTransferId: stripeTransfer.id,
            status: 'COMPLETED',
          },
        });
        console.log(`[STRIPE WEBHOOK] 💸 Stripe Transfer SUCCESS: $${opOrder.transferAmount} to ${operator.id}`);
      } catch (transferErr: any) {
        console.error(`[STRIPE WEBHOOK ❌ TRANSFER ERROR] ${operator.id}:`, transferErr.message);
        await prisma.operatorOrder.update({
          where: { id: opOrder.id },
          data: { transferStatus: 'FAILED' },
        });
      }
    }
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK ❌ TRANSACTION FAILED]:`, error.message);
    throw error;
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
  handleMultiVendorOrderPaymentSuccess,
  handleUserSubscriptionSuccess,
  handleAdSubscriptionSuccess,
};
