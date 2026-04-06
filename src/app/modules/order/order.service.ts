import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { Prisma } from '@prisma/client';
import { StripeHelpers } from '../../../helpers.ts/stripeHelpers.js';
import { config } from '../../../config/index.js';

const create = async (payload: { cartId: string }) => {
  const { cartId } = payload;

  // 1. Fetch Cart with all related details for price calculation
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          service: true,
          bundle: true,
          selectedAddons: {
            include: {
              addon: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  if (!cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  // 2. Fetch Store and verify operator connection status
  const store = await prisma.store.findUnique({
    where: { id: cart.storeId },
    include: { operator: true }
  });

  if (!store) {
    throw new ApiError(404, "Store not found.");
  }



  // 3. Recalculate Prices based on current data
  let totalAmount = 0;
  const processedItems = cart.items.map(item => {
    let basePrice = 0;
    let name = "";

    if (item.service) {
      basePrice = Number(item.service.basePrice);
      name = item.service.name;
    } else if (item.bundle) {
      basePrice = Number(item.bundle.bundlePrice);
      name = item.bundle.name;
    }

    const addonsPrice = item.selectedAddons.reduce((sum, sa) => sum + Number(sa.addon.price), 0);
    const itemUnitPrice = basePrice + addonsPrice;
    const itemTotalPrice = itemUnitPrice * item.quantity;
    
    totalAmount += itemTotalPrice;

    return {
      serviceName: name,
      quantity: item.quantity,
      price: itemTotalPrice, // Total price for this line item (unit price * qty)
      serviceId: item.serviceId,
      bundleId: item.bundleId,
      addons: item.selectedAddons.map(sa => ({ addonId: sa.addonId }))
    };
  });

  // 4. ECONOMICS: Calculate platform fee and operator amount
  const feePercent = config.economics.platform_fee_percent;
  const totalInCents = Math.round(totalAmount * 100);
  const platformFeeInCents = Math.round(totalInCents * (feePercent / 100));
  const operatorAmountInCents = totalInCents - platformFeeInCents;

  const platformFee = platformFeeInCents / 100;
  const operatorAmount = operatorAmountInCents / 100;

  // 5. Create local Order record and items within a transaction
  const orderNumber = `ORD-${Date.now()}`;
  
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: cart.userId,
        storeId: cart.storeId,
        totalAmount,
        platformFee,
        operatorAmount,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    // Create Order Items and their Addons
    for (const item of processedItems) {
      const { addons, ...itemData } = item;
      const orderItem = await tx.orderItem.create({
        data: {
          ...itemData,
          orderId: order.id,
        }
      });

      if (addons.length > 0) {
        await tx.orderAddon.createMany({
          data: addons.map(a => ({
            orderItemId: orderItem.id,
            addonId: a.addonId
          }))
        });
      }
    }

    // 6. Cleanup: Clear the Cart
    // First delete addons, then items, then cart to avoid FK violations (if no cascade)
    for (const item of cart.items) {
      await tx.selectedAddon.deleteMany({ where: { cartItemId: item.id } });
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.delete({ where: { id: cart.id } });

    return order;
  });

  // 7. Generate Stripe Payment URL
  const paymentUrl = await StripeHelpers.createOrderPaymentSession(
    result.id,
    totalAmount, // full subtotal
    0, // delivery fee if not in subtotal
    platformFee, // our commission
    cart.userId,
    store.operator.stripeConnectedAccountId
  );

  return { order: result, paymentUrl };
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
      store: { select: { name: true } },
    }
  });
  const total = await prisma.order.count({ where: whereConditions });

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
  const result = await prisma.order.findUnique({
    where: { id },
    include: { 
      orderItems: true, 
      payments: true,
      user: { select: { name: true, email: true, phone: true } },
      store: { select: { name: true, address: true, lat: true, lng: true } }
    }
  });
  if (!result) {
    throw new ApiError(404, 'Order not found');
  }
  return result;
};

const update = async (id: string, payload: any) => {
  await getById(id);
  const result = await prisma.order.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.order.delete({
    where: { id },
  });
  return result;
};

export const OrderService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
