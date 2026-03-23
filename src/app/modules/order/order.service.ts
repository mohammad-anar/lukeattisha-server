import { prisma } from "src/helpers.ts/prisma.js";
import ApiError from "src/errors/ApiError.js";
import httpStatus from "http-status";
import { IOrderCreatePayload, IOrderUpdateStatusPayload } from "./order.interface.js";

/* ================= CREATE ORDER ================= */
const createOrder = async (userId: string, payload: IOrderCreatePayload) => {
  const { items, operatorId, paymentMethod, ...rest } = payload;

  // Fetch prices for all services
  const serviceIds = items.map((i) => i.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    include: { addons: true },
  });

  let totalAmount = 0;

  const orderItems = items.map((item) => {
    const svc = services.find((s) => s.id === item.serviceId);
    if (!svc) throw new ApiError(httpStatus.NOT_FOUND, `Service ${item.serviceId} not found`);

    const basePrice = Number(svc.basePrice) * item.quantity;
    let addonTotal = 0;

    const addonData = (item.addonIds ?? []).map((addonId) => {
      const addon = svc.addons.find((a) => a.id === addonId);
      if (!addon) throw new ApiError(httpStatus.NOT_FOUND, `Addon ${addonId} not found`);
      addonTotal += Number(addon.price);
      return { addonId, price: addon.price };
    });

    totalAmount += basePrice + addonTotal;

    return {
      serviceId: item.serviceId,
      quantity: item.quantity,
      price: svc.basePrice,
      addons: { create: addonData },
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      operatorId,
      paymentMethod,
      totalAmount,
      ...rest,
      pickupDate: new Date(rest.pickupDate),
      items: { create: orderItems },
    },
    include: {
      items: { include: { addons: true, service: true } },
    },
  });

  return order;
};

/* ================= GET MY ORDERS (user) ================= */
const getMyOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { service: true, addons: { include: { addon: true } } } },
      orderStatusLogs: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET OPERATOR ORDERS ================= */
const getOperatorOrders = async (userId: string) => {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");

  return await prisma.order.findMany({
    where: { operatorId: profile.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { service: true, addons: { include: { addon: true } } } },
      orderStatusLogs: { orderBy: { createdAt: "desc" } },
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
      items: { include: { service: true, addons: { include: { addon: true } } } },
      orderStatusLogs: { orderBy: { createdAt: "desc" } },
      payments: true,
    },
  });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};

/* ================= UPDATE ORDER STATUS ================= */
const updateOrderStatus = async (id: string, payload: IOrderUpdateStatusPayload) => {
  await getOrderById(id);

  const [order] = await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status: payload.status } }),
    prisma.orderStatusLog.create({ data: { orderId: id, status: payload.status, note: payload.note } }),
  ]);

  return order;
};

/* ================= CANCEL ORDER ================= */
const cancelOrder = async (userId: string, id: string) => {
  const order = await getOrderById(id);
  if (order.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  if (order.status !== "PENDING") throw new ApiError(httpStatus.BAD_REQUEST, "Only pending orders can be cancelled");

  return await prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
};

/* ================= GET ALL ORDERS (admin) ================= */
const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      operator: { select: { id: true, storeName: true } },
      items: true,
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
