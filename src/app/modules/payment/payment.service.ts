import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers, stripe } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';
import { emailHelper } from '../../../helpers.ts/emailHelper.js';
import { generateTransactionId, generateInvoiceNumber } from '../../../helpers.ts/idGenerator.js';
import { NotificationService } from '../notification/notification.service.js';

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
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK ❌ ERROR] Verification Failed: ${err.message}`);
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  const session = event.data.object as any;

  try {
    switch (event.type as string) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(session);
        break;
      case "account.updated":
        await handleAccountUpdated(session);
        break;
      case "financial_connections.account.created":
      case "person.updated":
      case "capability.updated":
      case "account.external_account.created":
      case "transfer.created":
      case "payment.created":
      case "payment_intent.created":
      case "payment_intent.succeeded":
      case "charge.succeeded":
        // Intentionally ignored, no action needed for these intermediary onboarding or processed transaction steps
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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonth);

  const transactionId = generateTransactionId();
  const invoiceNumber = generateInvoiceNumber();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isSubscribed: true },
    });
    
    const subscription = await tx.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        startDate,
        endDate,
        status: "ACTIVE",
        stripePaymentId: session.subscription as string,
        transactionId,
      },
    });

    await tx.invoice.create({
      data: {
        invoiceNumber,
        transactionId,
        userSubscriptionId: subscription.id,
        userId,
        amount: plan.price,
        status: "PAID",
      },
    });
  });

  // Send Emails
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  
  const emailContent = `
    <h1>Payment Successful</h1>
    <p>Thank you for subscribing to ${plan.name}!</p>
    <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    <p><strong>Amount Paid:</strong> $${plan.price}</p>
    <p><strong>Duration:</strong> ${plan.durationMonth} Month(s)</p>
    <p><strong>Expiry Date:</strong> ${endDate.toLocaleDateString()}</p>
  `;

  await emailHelper.sendEmail({
    to: user.email,
    subject: `Invoice - ${plan.name} Subscription`,
    html: emailContent,
  });

  if (admin) {
    await emailHelper.sendEmail({
      to: admin.email,
      subject: `New User Subscription - ${user.name}`,
      html: `
        <h1>New Subscription</h1>
        <p>User ${user.name} (${user.email}) has purchased ${plan.name}.</p>
        <p><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p><strong>Transaction:</strong> ${transactionId}</p>
        <p><strong>Amount:</strong> $${plan.price}</p>
      `,
    });
  }

  // Notifications
  await NotificationService.create({
    userId,
    title: 'Subscription Activated',
    message: `Payment successful! Your ${plan.name} subscription is now active.`,
    type: 'SYSTEM'
  });

  if (admin) {
    await NotificationService.create({
      userId: admin.id,
      title: 'New User Subscription',
      message: `User ${user.name} has subscribed to ${plan.name}.`,
      type: 'SYSTEM'
    });
  }
};

const handleMultiVendorOrderPaymentSuccess = async (orderId: string, session: any) => {
  // 1. Fetch the Order and attached Payment with necessary includes
  let payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          operatorOrders: { include: { operator: { include: { user: true } } } },
          user: true,
        },
      },
    },
  });

  // If payment record is missing (e.g. manually deleted), fetch order directly
  if (!payment) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
          operatorOrders: { include: { operator: { include: { user: true } } } },
          user: true,
        }
    });

    if (!order) {
        console.error(`[STRIPE WEBHOOK ❌ ERROR] Order ${orderId} not found. Recovery failed.`);
        return;
    }

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
                    operatorOrders: { include: { operator: { include: { user: true } } } },
                    user: true,
                },
            },
        }
    }) as any;
  }

  if (payment!.status === "PAID") return;

  const order = payment!.order;
  const transactionId = generateTransactionId();
  const invoiceNumber = generateInvoiceNumber();

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
          stripePaymentIntentId: session.payment_intent as string || session.id,
          transactionId,
        },
      });

      // 2. Create Invoice
      await tx.invoice.create({
        data: {
          invoiceNumber,
          transactionId,
          orderId: order.id,
          userId: order.userId,
          amount: order.totalAmount,
          status: "PAID",
        },
      });

      // 3. Platform Revenue (Admin Wallet)
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

        // 4. Subscription Handling: Admin absorbs delivery fee
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

      // 5. Operator Revenue (Internal Wallets)
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

    // 6. Send Emails
    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    
    // Email to User
    const userEmailContent = `
      <h1>Invoice for Order ${order.orderNumber}</h1>
      <p>Your payment was successful!</p>
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
      <p>Thank you for using Laundry Link!</p>
    `;
    await emailHelper.sendEmail({ to: order.user.email, subject: `Invoice - Order ${order.orderNumber}`, html: userEmailContent });

    // Email to Operators
    for (const opOrder of order.operatorOrders) {
      const opEmailContent = `
        <h1>New Order Payment Received</h1>
        <p>You have received a new payment for order ${order.orderNumber}.</p>
        <p><strong>Amount Credited to Wallet:</strong> $${opOrder.transferAmount}</p>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      `;
      await emailHelper.sendEmail({ to: opOrder.operator.user.email, subject: `Notification - Order Payment`, html: opEmailContent });
    }

    // Email to Admin
    if (admin) {
      await emailHelper.sendEmail({
        to: admin.email,
        subject: `Order Payment Successful - ${order.orderNumber}`,
        html: `
          <h1>Payment Success</h1>
          <p>Order ${order.orderNumber} has been paid successfully.</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Platform Fee:</strong> $${order.platformFee}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        `,
      });
    }

    // Notifications
    // User Notification
    await NotificationService.create({
      userId: order.userId,
      title: 'Order Paid Successfully',
      message: `Your payment for order ${order.orderNumber} has been received.`,
      type: 'SYSTEM'
    });

    // Admin Notification
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (superAdmin) {
      await NotificationService.create({
        userId: superAdmin.id,
        title: 'New Payment Received',
        message: `Payment for order ${order.orderNumber} has been received. Amount: $${order.totalAmount}`,
        type: 'SYSTEM'
      });
    }

    // Operator Notifications
    for (const opOrder of order.operatorOrders) {
      await NotificationService.create({
        userId: opOrder.operator.userId,
        title: 'New Payment Received',
        message: `A new payment for order ${order.orderNumber} has been received and credited to your wallet.`,
        type: 'SYSTEM'
      });
    }

    // 7. External Stripe Transfers (Outside DB transaction)
    for (const opOrder of order.operatorOrders) {
      const operator = opOrder.operator;
      if (!operator.stripeAccountId) continue;

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
  // 1. Check if this payment session was already processed
  const existingSub = await prisma.adSubscription.findFirst({
    where: { stripePaymentId: session.id },
  });
  if (existingSub) {
    console.log(`[STRIPE WEBHOOK] Ad Subscription already processed for session: ${session.id}`);
    return;
  }

  // 2. Fetch the plan details and operator user
  const plan = await prisma.adSubscriptionPlan.findUnique({ 
    where: { id: planId } 
  });
  
  if (!plan) {
    console.error(`[STRIPE WEBHOOK ❌ ERROR] Plan ${planId} not found for ad subscription.`);
    return;
  }

  const operator = await prisma.operator.findUnique({
    where: { id: operatorId },
    include: { user: true }
  });

  if (!operator) {
    console.error(`[STRIPE WEBHOOK ❌ ERROR] Operator ${operatorId} not found for ad subscription.`);
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  const duration = plan.durationMonth || 1;
  endDate.setMonth(endDate.getMonth() + duration);

  const transactionId = generateTransactionId();
  const invoiceNumber = generateInvoiceNumber();

  console.log(`[STRIPE WEBHOOK] 🚀 Activating Ad Subscription for Operator: ${operator.user.name}, Plan: ${plan.name}`);

  // 3. Create active subscription and invoice
  await prisma.$transaction(async (tx) => {
    const sub = await tx.adSubscription.create({
      data: {
        operatorId,
        planId,
        startDate,
        endDate,
        status: "ACTIVE",
        stripePaymentId: session.id,
        transactionId,
      },
    });

    await tx.invoice.create({
      data: {
        invoiceNumber,
        transactionId,
        adSubscriptionId: sub.id,
        userId: operator.userId,
        amount: plan.price,
        status: "PAID",
      },
    });
  });

  // 4. Send Emails
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });

  const emailContent = `
    <h1>Ad Subscription Activated</h1>
    <p>Success! Your ad subscription for ${plan.name} is now active.</p>
    <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    <p><strong>Plan:</strong> ${plan.name}</p>
    <p><strong>Amount:</strong> $${plan.price}</p>
    <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString()}</p>
  `;

  await emailHelper.sendEmail({
    to: operator.user.email,
    subject: `Invoice - Ad Subscription: ${plan.name}`,
    html: emailContent,
  });

  if (admin) {
    await emailHelper.sendEmail({
      to: admin.email,
      subject: `New Ad Subscription - ${operator.user.name}`,
      html: `
        <h1>New Ad Subscription</h1>
        <p>Operator ${operator.user.name} (${operator.user.email}) has subscribed to ${plan.name}.</p>
        <p><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p><strong>Transaction:</strong> ${transactionId}</p>
        <p><strong>Amount:</strong> $${plan.price}</p>
      `,
    });
  }

  // Notifications
  await NotificationService.create({
    userId: operator.userId,
    title: 'Ad Subscription Activated',
    message: `Success! Your ad subscription for ${plan.name} is now active.`,
    type: 'SYSTEM'
  });

  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (superAdmin) {
    await NotificationService.create({
      userId: superAdmin.id,
      title: 'New Ad Subscription',
      message: `Operator ${operator.user.name} has subscribed to ad plan ${plan.name}.`,
      type: 'SYSTEM'
    });
  }

  console.log(`[STRIPE WEBHOOK] ✅ Ad Subscription created successfully until ${endDate.toISOString()}`);
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

const handleAccountUpdated = async (account: any) => {
  const stripeAccountId = account.id;
  const operator = await prisma.operator.findUnique({
    where: { stripeAccountId }
  });

  if (operator) {
    // Treat as active if details were submitted OR payouts are enabled 
    // (In test mode, payouts_enabled can lazily update after details_submitted is true)
    const isReady = account.details_submitted || (account.charges_enabled && account.payouts_enabled);
    const newStatus = isReady ? "ACTIVE" : "ONBOARDING";
    
    if (operator.stripeAccountStatus !== newStatus) {
      await prisma.operator.update({
        where: { id: operator.id },
        data: { stripeAccountStatus: newStatus }
      });
      console.log(`[STRIPE WEBHOOK] 🔄 Operator ${operator.id} status updated to ${newStatus}`);
    }
  }
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
