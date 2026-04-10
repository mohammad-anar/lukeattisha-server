import ApiError from '../../../errors/ApiError.js';
import { prisma } from '../../../helpers.ts/prisma.js';

const getOrCreateCart = async (userId: string) => {
  if (!userId) {
    throw new ApiError(400, 'User ID is required for cart operations');
  }

  const adminSetting = await prisma.adminSetting.findFirst();
  const pickupAndDeliveryFee = adminSetting?.pickupAndDeliveryFee || 4.99;
  const result = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: { userId },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
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
    },
  });
  return {
    ...result,
    pickupAndDeliveryFee
  }
};

const addItem = async (userId: string, dto: { serviceId?: string, bundleId?: string, quantity: number, addonIds?: string[] }) => {
  const cart = await getOrCreateCart(userId);

  let storeId: string;
  let operatorId: string;
  let price: number;

  if (dto.serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: {
        operator: true,
        storeServices: { take: 1 }
      },
    });
    if (!service) throw new ApiError(404, 'Service not found');
    if (service.operator.stripeAccountStatus !== 'ACTIVE') {
      throw new ApiError(400, 'This service is not available for purchase (Operator not active).');
    }
    storeId = service.storeServices[0]?.storeId;
    if (!storeId) throw new ApiError(400, 'This service is not assigned to any store');
    operatorId = service.operatorId;
    price = Number(service.basePrice);
  } else if (dto.bundleId) {
    const bundle = await prisma.bundle.findUnique({
      where: { id: dto.bundleId },
      include: {
        operator: true,
        storeBundles: { take: 1 }
      },
    });
    if (!bundle) throw new ApiError(404, 'Bundle not found');
    // if (bundle.operator.stripeAccountStatus !== 'ACTIVE') {
    //   throw new ApiError(400, 'This bundle is not available for purchase (Operator not active).');
    // }
    storeId = bundle.storeBundles[0]?.storeId;
    if (!storeId) throw new ApiError(400, 'This bundle is not assigned to any store');
    operatorId = bundle.operatorId;
    price = Number(bundle.bundlePrice);
  } else {
    throw new ApiError(400, 'serviceId or bundleId is required.');
  }

  // Calculate price with addons
  if (dto.addonIds && dto.addonIds.length > 0) {
    const addons = await prisma.addon.findMany({
      where: { id: { in: dto.addonIds } }
    });
    const addonsPrice = addons.reduce((sum, a) => sum + Number(a.price), 0);
    price += addonsPrice;
  }

  console.log(cart.id, storeId, operatorId, dto.serviceId, dto.bundleId, dto.quantity, price);

  const result = await prisma.cartItem.upsert({
    where: dto.serviceId
      ? { cartId_serviceId: { cartId: cart.id, serviceId: dto.serviceId } }
      : { cartId_bundleId: { cartId: cart.id, bundleId: dto.bundleId! } },
    create: {
      cartId: cart.id,
      storeId,
      operatorId,
      serviceId: dto.serviceId,
      bundleId: dto.bundleId,
      quantity: dto.quantity,
      price: price,
      selectedAddons: dto.addonIds?.length
        ? { create: dto.addonIds.map((addonId) => ({ addonId })) }
        : undefined,
    },
    update: { quantity: dto.quantity },
  });

  return result;
};

// update quqantity
const updateQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiError(404, 'Cart not found');
  return await prisma.cartItem.update({
    where: { id: cartItemId, cartId: cart.id },
    data: { quantity },
  });
};

const removeItem = async (userId: string, cartItemId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiError(404, 'Cart not found');
  return await prisma.cartItem.delete({
    where: { id: cartItemId, cartId: cart.id },
  });
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  return await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

const getMyCart = async (userId: string) => {
  return await getOrCreateCart(userId);
};

export const CartService = {
  addItem,
  removeItem,
  clearCart,
  getMyCart,
  getOrCreateCart,
  updateQuantity,
};
