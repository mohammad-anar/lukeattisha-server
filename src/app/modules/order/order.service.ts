import httpStatus from "http-status";
import {
  IOrderCreatePayload,
  IOrderUpdateStatusPayload,
  IOrderCreateResponse,
} from "./order.interface.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";
import { createOrderPaymentSession } from "../../../helpers.ts/stripeHelpers.js";

/* ================= CREATE ORDER ================= */
const createOrder = async (
  userId: string,
  payload: IOrderCreatePayload
): Promise<IOrderCreateResponse> => {
  const {
    items,
    operatorId,
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
    // 1. Fetch all services with addons
    const serviceIds = items.map((i) => i.serviceId);

    const services = await tx.service.findMany({
      where: { id: { in: serviceIds } },
      include: { addons: true },
    });

    let totalAmount = 0;

    // Check if user is subscribed
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { isSubscribed: true },
    });

    if (!user?.isSubscribed) {
      totalAmount += 4.99; // Delivery Fee
    }

    // 2. Prepare OrderItems CREATE INPUT
    const orderItemsCreateInput: any[] = [];

    for (const item of items) {
      const svc = services.find((s) => s.id === item.serviceId);

      if (!svc) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Service ${item.serviceId} not found`,
        );
      }

      const basePrice = Number(svc.basePrice) * item.quantity;
      let addonTotal = 0;

      const addonCreateInput: any[] = [];

      for (const addonId of item.addonIds ?? []) {
        const addon = svc.addons.find((a) => a.id === addonId);

        if (!addon) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Addon ${addonId} not found`,
          );
        }

        addonTotal += Number(addon.price) * item.quantity;

        addonCreateInput.push({
          addonId,
          price: addon.price,
        });
      }

      totalAmount += basePrice + addonTotal;
      
      orderItemsCreateInput.push({
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: svc.basePrice,
        addons: {
          create: addonCreateInput,
        },
      });
    }

    // 3. Create Order
    const order = await tx.order.create({
      data: {
        userId,
        operatorId,
        total: totalAmount,

        pickupAt: new Date(pickupAt),
        dropoffAt: new Date(dropoffAt),

        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude,

        pickupAddress,
        dropoffAddress,

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
          },
        },
        orderStatusLogs: true,
      },
    });

    // 4. Optional: create Payment record (recommended)
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: paymentMethod,
        status: "PENDING",
      },
    });

    // 5. Generate Stripe Payment Link
    let paymentUrl = null;

    // Any electronic payment method will trigger a Stripe Checkout Session
    if (
      paymentMethod === "CARD" ||
      paymentMethod === "APPLE_PAY" ||
      paymentMethod === "GOOGLE_PAY"
    ) {
      paymentUrl = await createOrderPaymentSession(
        order.id,
        totalAmount,
        userId,
        !user?.isSubscribed // includeDeliveryFee if not subscribed
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
      operator: true,
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
    where: { operatorId: profile.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      operator: true,
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
      operator: true,
      orderItems: true,
      orderStatusLogs: { orderBy: { createdAt: "desc" } },
      payments: true,
    },
  });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};

/* ================= UPDATE ORDER STATUS ================= */
const updateOrderStatus = async (
  id: string,
  payload: IOrderUpdateStatusPayload,
) => {
  await getOrderById(id);

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
      operator: { select: { id: true, storeName: true } },
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
