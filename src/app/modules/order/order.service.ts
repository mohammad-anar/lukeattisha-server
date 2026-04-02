import httpStatus from "http-status";
import {
  IOrderCreatePayload,
  IOrderUpdateStatusPayload,
  IOrderCreateResponse,
} from "./order.interface.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";
import { createOrderPaymentSession } from "../../../helpers.ts/stripeHelpers.js";
import { OperatorService } from "../operator/operator.service.js";

/* ================= CREATE ORDER ================= */
const createOrder = async (
  userId: string,
  payload: IOrderCreatePayload
): Promise<IOrderCreateResponse> => {
  const {
    cartId,
    paymentMethod,
    pickupAt,
    dropoffAt,
    pickupLatitude,
    pickupLongitude,
    dropoffLatitude,
    dropoffLongitude,
    pickupAddress,
    dropoffAddress,
    ...rest
  } = payload;

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Cart
    const cart = await tx.cart.findUnique({
      where: { id: cartId, userId },
      include: {
        items: {
          include: {
            service: true,
            serviceBundle: true,
            addons: {
              include: { addon: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty or not found");
    }

    let subtotalAmount = 0;
    const operatorIds = new Set<string>();

    // 2. Check subscription
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: {
        userSubscriptions: {
          where: {
            status: "active",
            endDate: { gt: new Date() }
          }
        }
      }
    });

    const isSubscribed = user?.userSubscriptions && user.userSubscriptions.length > 0;
    const deliveryFeeAmount = isSubscribed ? 0.00 : 4.99;

    const orderItemsCreateInput: any[] = [];

    // 3. Process Cart Items to map them to Order Items and calculate total
    for (const item of cart.items) {
      const quantity = item.quantity || 1;
      let itemBasePrice = 0;
      let unitPrice = 0;

      if (item.serviceId && item.service) {
        operatorIds.add(item.service.operatorId);
        unitPrice = Number(item.service.basePrice);
        itemBasePrice = unitPrice * quantity;
      } else if (item.serviceBundleId && item.serviceBundle) {
        operatorIds.add(item.serviceBundle.operatorId);
        unitPrice = Number(item.serviceBundle.bundlePrice);
        itemBasePrice = unitPrice * quantity;
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Cart item must have a valid service or service bundle.");
      }

      let addonTotal = 0;
      const addonCreateInput: any[] = [];

      for (const cartItemAddon of item.addons) {
        const addon = cartItemAddon.addon;
        const addonPrice = Number(addon.price) * quantity;
        addonTotal += addonPrice;

        addonCreateInput.push({
          addonId: addon.id,
          price: addon.price.toString(),
        });
      }

      subtotalAmount += itemBasePrice + addonTotal;

      orderItemsCreateInput.push({
        serviceId: item.serviceId,
        serviceBundleId: item.serviceBundleId,
        quantity,
        price: unitPrice.toString(), 
        addons: {
          create: addonCreateInput,
        },
      });
    }

    // Calculate Platform split
    // In production, fetch config from AdminSetting! Using 10% defaults.
    const platformFeeAmount = Math.round((subtotalAmount * 0.10) * 100) / 100;
    const operatorEarningsAmount = subtotalAmount - platformFeeAmount;
    const totalCharge = subtotalAmount + deliveryFeeAmount;

    // 4. Create Order
    const order = await tx.order.create({
      data: {
        userId,
        operatorIds: Array.from(operatorIds),

        subtotal: subtotalAmount.toFixed(2),
        deliveryFee: deliveryFeeAmount.toFixed(2),
        platformFee: platformFeeAmount.toFixed(2),
        operatorEarnings: operatorEarningsAmount.toFixed(2),
        total: totalCharge.toFixed(2),

        pickupAt: new Date(pickupAt),
        dropoffAt: dropoffAt ? new Date(dropoffAt) : null,

        pickupLatitude: pickupLatitude ?? null,
        pickupLongitude: pickupLongitude ?? null,
        dropoffLatitude: dropoffLatitude ?? null,
        dropoffLongitude: dropoffLongitude ?? null,

        pickupAddress: pickupAddress ?? null,
        dropoffAddress: dropoffAddress ?? null,

        ...rest,

        orderItems: {
          create: orderItemsCreateInput,
        },

        orderStatusLogs: {
          create: {
            status: "PENDING",
            note: "Order created",
          },
        },
      },
      include: {
        orderItems: {
          include: {
            addons: true,
            service: true,
            serviceBundle: true,
          },
        },
        orderStatusLogs: true,
      },
    });

    // 5. Clear Cart Items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 5. Create Payment
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: totalCharge.toFixed(2), // ✅ Exact match to breakdown
        method: paymentMethod,
        status: "PENDING",
      },
    });

    // 6. Stripe Payment
    let paymentUrl = null;

    if (
      ["CARD", "APPLE_PAY", "GOOGLE_PAY"].includes(paymentMethod)
    ) {
      if (operatorIds.size === 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Operator is required for online payment"
        );
      }

      const firstOperatorId = Array.from(operatorIds)[0];
      const stripeConnectId = await OperatorService.ensureStripeConnectId(firstOperatorId);

      paymentUrl = await createOrderPaymentSession(
        order.id,
        subtotalAmount,
        deliveryFeeAmount,
        platformFeeAmount,
        userId,
        stripeConnectId,
        isSubscribed
      );
    }

    return {
      order,
      paymentUrl,
    };
  });
};

/* ================= GET MY ORDERS (user) ================= */
const getMyOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: true,
      orderStatusLogs: true,
      payments: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          userAddresses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET OPERATOR ORDERS ================= */
const getOperatorOrders = async (userId: string) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });
  if (!profile)
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");

  return await prisma.order.findMany({
    where: { operatorIds: { has: profile.id } },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      orderItems: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET SINGLE ORDER ================= */
const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      orderItems: true,
      orderStatusLogs: { orderBy: { createdAt: "desc" } },
      payments: true,
    },
  });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};

/* ================= UPDATE ORDER STATUS ================= */
import { WalletService } from "../wallet/wallet.services.js";
import { TransactionType, TransactionStatus } from "@prisma/client";

const updateOrderStatus = async (
  id: string,
  payload: IOrderUpdateStatusPayload,
) => {
  const existingOrder = await getOrderById(id);

  if (payload.status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id }, data: { status: payload.status } });
      
      await tx.orderStatusLog.create({
        data: { orderId: id, status: payload.status, note: payload.note },
      });

      // Credit operator wallets based on exact earnings ATOMICALLY
      for (const operatorId of existingOrder.operatorIds) {
        const wallet = await tx.wallet.findUnique({ where: { userId: operatorId } });
        if (wallet) {
          await tx.wallet.update({
            where: { userId: operatorId },
            data: { balance: { increment: existingOrder.operatorEarnings } },
          });
          
          await tx.transaction.create({
            data: {
              userId: operatorId,
              walletId: wallet.id,
              amount: existingOrder.operatorEarnings,
              type: TransactionType.CREDIT,
              status: TransactionStatus.COMPLETED,
            },
          });
        }
      }
      
      return order;
    });
  }

  // Normal status update without wallet logic
  const [order] = await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status: payload.status } }),
    prisma.orderStatusLog.create({
      data: { orderId: id, status: payload.status, note: payload.note },
    }),
  ]);

  return order;
};

/* ================= CANCEL ORDER ================= */
const cancelOrder = async (userId: string, id: string) => {
  const order = await getOrderById(id);
  if (order.userId !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  if (order.status !== "PENDING")
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only pending orders can be cancelled",
    );

  return await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

/* ================= GET ALL ORDERS (admin) ================= */
const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOperatorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
