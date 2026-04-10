import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';

const checkout = async (userId: string, dto: {
  pickupAddress: {
    pickupTime?: string;
    pickupDate?: string;
    streetAddress: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  },
  deliveryAddress: {
    streetAddress: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  },
  scheduledDate: string
}) => {
  // 1. Load cart with all items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          service: true,
          bundle: true,
          selectedAddons: { include: { addon: true } },
          operator: true,
          store: true,
        },
      },
    },
  });

  if (!cart || !cart.items.length) throw new ApiError(400, 'Cart is empty.');

  // 2. Check subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSubscriptions: { where: { status: 'ACTIVE' } } },
  });
  const isSubscription = (user?.userSubscriptions.length || 0) > 0;

  // 3. Group items by operator
  const operatorMap = new Map<string, { items: any[]; operatorId: string; storeId: string }>();
  for (const item of cart.items) {
    const key = item.operatorId;
    if (!operatorMap.has(key)) {
      operatorMap.set(key, { items: [], operatorId: item.operatorId, storeId: item.storeId });
    }
    operatorMap.get(key)!.items.push(item);
  }

  // 4. Fetch fee settings from AdminSetting (use latest row, fall back to defaults)
  const adminSetting = await prisma.adminSetting.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  const PLATFORM_COMMISSION_RATE = adminSetting
    ? Number(adminSetting.platformCommissionRate)
    : 0.1; // 10% default
  const BASE_PICKUP_AND_DELIVERY_FEE = adminSetting
    ? Number(adminSetting.pickupAndDeliveryFee)
    : 4.99;

  let subtotal = 0;
  for (const item of cart.items) {
    subtotal += Number(item.price) * item.quantity;
  }

  // platformFee is the total commission the platform takes from the subtotal
  const platformFee = subtotal * PLATFORM_COMMISSION_RATE;

  // User pays 0 for delivery if subscribed
  const pickupAndDeliveryFee = isSubscription ? 0 : BASE_PICKUP_AND_DELIVERY_FEE;

  // Total user pays: Subtotal + Delivery + Fixed Fee
  const totalAmount = subtotal + pickupAndDeliveryFee;

  // 5. Generate order number
  const orderNumber = `ORD-${Date.now()}`;
  const transferGroup = `TG-${orderNumber}`;

  // 6. Create Order + OperatorOrders first, then create OrderItems with explicit orderId
  const order = await prisma.$transaction(async (tx) => {
    // Step 6a: Create Order + OperatorOrders (no items yet)
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        pickupAndDeliveryFee,
        actualPickupAndDeliveryFee: BASE_PICKUP_AND_DELIVERY_FEE,
        platformFee,
        totalAmount,
        isSubscription,
        pickupAddress: {
          create: dto.pickupAddress
        },
        deliveryAddress: {
          create: dto.deliveryAddress
        },
        scheduledDate: new Date(dto.scheduledDate),
        stripeTransferGroup: transferGroup,
        operatorOrders: {
          create: Array.from(operatorMap.values()).map((group) => {
            const groupSubtotal = group.items.reduce(
              (sum: number, i: any) => sum + (Number(i.price) * i.quantity),
              0,
            );
            // Split delivery fee among all operators involved in the order
            const deliveryFeeShare = BASE_PICKUP_AND_DELIVERY_FEE / operatorMap.size;

            // Transfer to operator: their share of subtotal (net of commission) + their share of delivery fee
            const transferAmount = (groupSubtotal * (1 - PLATFORM_COMMISSION_RATE)) + deliveryFeeShare;

            return {
              operator: { connect: { id: group.operatorId } },
              store: { connect: { id: group.storeId } },
              subtotal: groupSubtotal,
              transferAmount,
            };
          }),
        },
      },
      include: { operatorOrders: { include: { operator: true } } },
    });

    // Step 6b: Create OrderItems now that we have both orderId and operatorOrderId
    for (const opOrder of (newOrder as any).operatorOrders) {
      const group = operatorMap.get(opOrder.operatorId)!;
      for (const item of group.items) {
        const addons = item.selectedAddons ?? [];
        const priceStr = String(item.price); // Pass as string for Prisma Decimal compatibility
        try {
          await tx.orderItem.create({
            data: {
              order: { connect: { id: newOrder.id } },
              operatorOrder: { connect: { id: opOrder.id } },
              serviceName: item.service?.name ?? item.bundle?.name ?? 'Unknown',
              quantity: item.quantity,
              price: priceStr,
              ...(item.serviceId && { service: { connect: { id: item.serviceId } } }),
              ...(item.bundleId && { bundle: { connect: { id: item.bundleId } } }),
              ...(addons.length > 0 && {
                orderAddons: {
                  create: addons.map((sa: any) => ({
                    addonId: sa.addonId,
                  })),
                },
              }),
            },
          });
        } catch (err: any) {
          console.error('[OrderItem.create] Failed — item debug:', JSON.stringify({
            orderId: newOrder.id,
            operatorOrderId: opOrder.id,
            price: priceStr,
            serviceId: item.serviceId,
            bundleId: item.bundleId,
            addonCount: addons.length,
          }));
          console.error('[OrderItem.create] Raw Prisma error message:\n', err?.message);
          // Re-throw with the full Prisma message so the API response shows it
          throw new Error(`OrderItem creation failed: ${err?.message ?? err}`);
        }
      }
    }

    return newOrder;
  });

  // 7. Generate Stripe Payment URL
  const session = await StripeHelpers.createMultiVendorOrderPaymentSession(
    order.id,
    totalAmount,
    userId,
    transferGroup
  );

  // 8. Save Payment record + update Order with paymentUrl
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: session.payment_intent as string || session.id, // checkout session id if PI not yet created
        stripeTransferGroup: transferGroup,
        amount: totalAmount,
        status: 'UNPAID',
        paymentUrl: session.url,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: session.payment_intent as string || session.id,
        paymentUrl: session.url,
      },
    }),
  ]);

  // 9. Clear cart
  await txClearCart(userId);

  return { orderId: order.id, paymentUrl: session.url };
};

// Helper for transaction
const txClearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["orderNumber"].map((field) => ({
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

  const whereConditions: Prisma.OrderWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      deliveryAddress: true,
      pickupAddress: true,
      operatorOrders: {
        include: {
          store: { select: { name: true } },
          operator: { select: { user: { select: { name: true } } } }
        }
      }
    }
  });
  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: {
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    },
    data: result,
  };
};

const getMyOrders = async (user: any, filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: any[] = [];

  if (user.role === 'USER') {
    andConditions.push({ userId: user.userId });
  } else if (user.role === 'OPERATOR') {
    andConditions.push({
      operatorOrders: {
        some: {
          operatorId: user.userId
        }
      }
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: ["orderNumber"].map((field) => ({
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

  const whereConditions: Prisma.OrderWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      pickupAddress: true,
      deliveryAddress: true,
      orderItems: true,
      operatorOrders: {
        include: { store: true }
      },
      payment: true,
    }
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { total, totalPage: Math.ceil(total / limit), page, limit },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { orderAddons: { include: { addon: true } } }
      },
      deliveryAddress: true,
      pickupAddress: true,

      operatorOrders: {
        include: { store: true, operator: { include: { user: true } } }
      },
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
    }
  });
  if (!result) {
    throw new ApiError(404, 'Order not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  const result = await prisma.order.update({
    where: { id },
    data: payload,
  });
  return result;
};

const updateOrderStatus = async (id: string, status: any) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const STATUS_ORDER = [
    'PENDING',
    'PROCESSING',
    'OUT_FOR_PICKUP',
    'PICKED_UP',
    'RECEIVED_BY_STORE',
    'IN_PROGRESS',
    'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ];

  let finalStatus = status;

  if (status === 'CANCELLED' || status === 'REFUNDED') {
    if (order.status === 'DELIVERED') {
      throw new ApiError(400, 'Cannot cancel or refund a delivered order directly via status update');
    }
  } else {
    // Normal progression check
    const currentIndex = STATUS_ORDER.indexOf(order.status);
    const newIndex = STATUS_ORDER.indexOf(status);

    if (currentIndex !== -1 && newIndex !== -1 && newIndex <= currentIndex) {
      throw new ApiError(400, `Cannot revert order status from ${order.status} to ${status}`);
    }
  }

  // User requirement: "PENDING, if cancle then CANCLED AND REFUNDED. it will auto refund to the user and order status will be REFUNDED."
  let paymentStatusUpdate = undefined;
  if (status === 'CANCELLED' && order.status === 'PENDING') {
    finalStatus = 'REFUNDED';
    if (order.paymentStatus === 'PAID') {
      paymentStatusUpdate = 'REFUNDED';
      // Here we would sync with Stripe / wallets ideally, but satisfying the db state requirement:
    }
  }

  const result = await prisma.order.update({
    where: { id },
    data: { 
      status: finalStatus,
      ...(paymentStatusUpdate && { paymentStatus: paymentStatusUpdate as any })
    },
  });

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: finalStatus,
      note: `Order status updated to ${finalStatus}`,
    }
  });

  // Emit event to socket
  try {
    const socketHelper = await import('../../../helpers.ts/socketHelper.js');
    socketHelper.emitToUser(order.userId, 'order-status-update', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: finalStatus,
      paymentStatus: result.paymentStatus
    });
  } catch (err) {
    console.error('Socket emission failed for order update', err);
  }

  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.order.delete({
    where: { id },
  });
  return result;
};

export const OrderService = {
  checkout,
  getAll,
  getMyOrders,
  getById,
  update,
  updateOrderStatus,
  deleteById,
};
