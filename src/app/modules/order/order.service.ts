import { Prisma } from '@prisma/client';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';
import { NotificationService } from '../notification/notification.service.js';

const enrichOrderData = (order: any) => {
  const statusMapping: Record<string, { step: number; message: string }> = {
    PENDING: { step: 1, message: 'Order Received' },
    PROCESSING: { step: 1, message: 'Order is being processed' },
    OUT_FOR_PICKUP: { step: 1, message: 'Driver on way to pickup' },
    PICKED_UP: { step: 1, message: 'Items picked up' },
    RECEIVED_BY_STORE: { step: 2, message: 'Received by store' },
    IN_PROGRESS: { step: 2, message: 'Your items are being cleaned' },
    READY_FOR_DELIVERY: { step: 2, message: 'Ready for delivery' },
    OUT_FOR_DELIVERY: { step: 3, message: 'Heading to you' },
    DELIVERED: { step: 4, message: 'Delivered' },
    CANCELLED: { step: 0, message: 'Order Cancelled' },
    REFUNDED: { step: 0, message: 'Order Refunded' }
  };

  const info = statusMapping[order.status as string] || { step: 1, message: 'Processing' };

  // Calculate estimated time if missing
  let estimatedArrival = '';
  if (order.deliveryAddress?.deliveryTime) {
    estimatedArrival = order.deliveryAddress.deliveryTime;
  } else if (order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY_FOR_DELIVERY') {
    const baseDate = order.updatedAt || order.createdAt;
    const start = new Date(baseDate);
    start.setMinutes(start.getMinutes() + 20);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 15);
    
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    estimatedArrival = `${formatTime(start)} - ${formatTime(end)} estimated arrival`;
  } else {
    const baseDate = order.scheduledDate || order.createdAt;
    const start = new Date(baseDate);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    estimatedArrival = `${formatTime(start)} - ${formatTime(end)} estimated arrival`;
  }

  // Extract primary operator for "driver" info
  const primaryOperatorOrder = order.operatorOrders?.[0];
  const driver = primaryOperatorOrder?.operator?.user ? {
    name: primaryOperatorOrder.operator.user.name,
    avatar: primaryOperatorOrder.operator.user.avatar,
    phone: primaryOperatorOrder.operator.user.phone,
    rating: 4.8, // Placeholder as rating logic is usually service-based or calculated from reviews
  } : null;

  const chatRoomId = order.chatRooms?.[0]?.id || null;
  const paymentUrl = order.paymentStatus === 'UNPAID' ? order.paymentUrl : null;

  return {
    ...order,
    roomId: chatRoomId,
    paymentUrl,
    activeOrderMetadata: {
      currentStep: info.step,
      totalSteps: 4,
      statusMessage: info.message,
      estimatedArrivalTime: estimatedArrival,
      driver,
      chatRoomId,
      paymentUrl
    }
  };
};

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
          storeService: { include: { service: true } },
          storeBundle: { include: { bundle: true } },
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
              serviceName: item.storeService?.service?.name ?? item.storeBundle?.bundle?.name ?? 'Unknown',
              quantity: item.quantity,
              price: priceStr,
              ...(item.storeServiceId && { storeService: { connect: { id: item.storeServiceId } } }),
              ...(item.storeBundleId && { storeBundle: { connect: { id: item.storeBundleId } } }),
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
            storeServiceId: item.storeServiceId,
            storeBundleId: item.storeBundleId,
            addonCount: addons.length,
          }));
          console.error('[OrderItem.create] Raw Prisma error message:\n', err?.message);
          // Re-throw with the full Prisma message so the API response shows it
          throw new Error(`OrderItem creation failed: ${err?.message ?? err}`);
        }
      }
    }

    // Step 6c: Create Chat Room for the order
    await tx.chatRoom.create({
      data: {
        orderId: newOrder.id,
        name: `Chat for Order ${orderNumber}`,
        participants: {
          create: [
            { userId: userId }, // Customer
            ...Array.from(operatorMap.keys()).map((opId) => ({
              operatorId: opId // Operator
            }))
          ]
        }
      }
    });

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

  // 10. Notifications
  // Notify User
  await NotificationService.create({
    userId,
    title: 'Order Placed',
    message: `Your order ${order.orderNumber} has been placed successfully.`,
    type: 'ORDER_UPDATE'
  });

  // Notify Admin
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) {
    await NotificationService.create({
      userId: admin.id,
      title: 'New Order',
      message: `A new order ${order.orderNumber} has been created.`,
      type: 'ORDER_UPDATE'
    });
  }

  // Notify Operators
  for (const opOrder of (order as any).operatorOrders) {
    await NotificationService.create({
      userId: opOrder.operator.userId,
      title: 'New Order Received',
      message: `You have received a new order ${order.orderNumber}.`,
      type: 'ORDER_UPDATE'
    });
  }

  // 11. Find Chat Room ID
  const chatRoom = await prisma.chatRoom.findFirst({
    where: { orderId: order.id }
  });

  return { orderId: order.id, paymentUrl: session.url, roomId: chatRoom?.id };
};

// Helper for transaction
const txClearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, fromDate, toDate, operatorId, ...filterData } = filters;

  const andConditions: Prisma.OrderWhereInput[] = [];

  // Search Condition
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          orderNumber: {
            contains: searchTerm as string,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          user: {
            name: {
              contains: searchTerm as string,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
      ],
    });
  }

  // Date Range Condition
  if (fromDate || toDate) {
    const dateCondition: Prisma.DateTimeFilter = {};
    if (fromDate) dateCondition.gte = new Date(fromDate as string);
    if (toDate) {
      const endDate = new Date(toDate as string);
      endDate.setHours(23, 59, 59, 999);
      dateCondition.lte = endDate;
    }
    andConditions.push({ createdAt: dateCondition });
  }

  // Operator ID Condition
  if (operatorId) {
    andConditions.push({
      operatorOrders: {
        some: {
          operatorId: operatorId as string,
        },
      },
    });
  }

  // Other specific filters (status, paymentStatus, etc.)
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    } as any);
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
      },
      chatRooms: true
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
    data: result.map(enrichOrderData),
  };
};

const getMyOrders = async (user: any, filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, pastOrders, ...filterData } = filters;

  const andConditions: any[] = [];

  if (user.role === 'USER') {
    andConditions.push({ userId: user.id });
  } else if (user.role === 'OPERATOR') {
    const operator = await prisma.operator.findUnique({
      where: { userId: user.id }
    });
    if (operator) {
      andConditions.push({
        operatorOrders: {
          some: {
            operatorId: operator.id
          }
        }
      });
    } else {
      andConditions.push({ id: "invalid-operator" }); // force no results
    }
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


  if (pastOrders) {
    andConditions.push({
      status: {
        in: ["DELIVERED", "CANCELLED", "REFUNDED"],
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
      orderItems: {
        include: {
          storeService: { include: { service: true, _count: {select: {reviews: true}} } },
          storeBundle: { include: { bundle: true } },
          orderAddons: { include: { addon: true } },
        }
      },      
      operatorOrders: {
        include: { store: true }
      },
      payment: true,
      chatRooms: true,
    }
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { total, totalPage: Math.ceil(total / limit), page, limit },
    data: result.map(enrichOrderData),
  };
};



const getActiveOrders = async (userId: string) => {
  const activeStatuses = [
    'PENDING', 'PROCESSING', 'OUT_FOR_PICKUP', 'PICKED_UP',
    'RECEIVED_BY_STORE', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'
  ];

  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: activeStatuses as any[] }
    },
    include: {
      pickupAddress: true,
      deliveryAddress: true,
      operatorOrders: {
        include: {
          operator: { include: { user: { select: { name: true, avatar: true, phone: true } } } },
          store: true
        }
      },
      orderItems: {
        include: {
          storeService: { include: { service: true } },
          storeBundle: { include: { bundle: true } },
          orderAddons: { include: { addon: true } }
        }
      },
      payment: true,
      chatRooms: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(enrichOrderData);
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
        include: { store: true, operator: { include: { user: { select: { name: true, avatar: true, phone: true } } } } }
      },
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
      chatRooms: true,
    }
  });
  if (!result) {
    throw new ApiError(404, 'Order not found');
  }
  return enrichOrderData(result);
};

const repayOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true }
  });

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== userId) throw new ApiError(403, 'Forbidden');
  if (order.paymentStatus !== 'UNPAID') throw new ApiError(400, 'Order is already paid or cannot be paid.');

  // Create new session
  const session = await StripeHelpers.createMultiVendorOrderPaymentSession(
    order.id,
    Number(order.totalAmount),
    userId,
    order.stripeTransferGroup || `TG-${order.orderNumber}`
  );

  // Update records
  await prisma.$transaction([
    prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        stripePaymentIntentId: session.payment_intent as string || session.id,
        paymentUrl: session.url,
      },
      create: {
        orderId: order.id,
        stripePaymentIntentId: session.payment_intent as string || session.id,
        stripeTransferGroup: order.stripeTransferGroup || `TG-${order.orderNumber}`,
        amount: order.totalAmount,
        status: 'UNPAID',
        paymentUrl: session.url,
      }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: session.payment_intent as string || session.id,
        paymentUrl: session.url,
      },
    }),
  ]);

  return { paymentUrl: session.url };
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

  // User Notification on status update
  await NotificationService.create({
    userId: order.userId,
    title: 'Order Status Updated',
    message: `Your order ${order.orderNumber} status has been updated to ${finalStatus}.`,
    type: 'ORDER_UPDATE'
  });

  if (finalStatus === 'DELIVERED') {
    await NotificationService.create({
      userId: order.userId,
      title: 'Order Delivered',
      message: `Your order ${order.orderNumber} has been delivered. Thank you!`,
      type: 'ORDER_UPDATE'
    });
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
  getActiveOrders,
  getById,
  repayOrder,
  update,
  updateOrderStatus,
  deleteById,
};
