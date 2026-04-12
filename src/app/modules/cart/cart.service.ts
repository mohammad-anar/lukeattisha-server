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
          storeService: { include: { service: true } },
          storeBundle: { include: { bundle: true } },
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

const addItem = async (userId: string, dto: { storeServiceId?: string, storeBundleId?: string, quantity: number, addonIds?: string[] }) => {
  const cart = await getOrCreateCart(userId);

  let storeId: string;
  let operatorId: string;
  let price: number;

  if (dto.storeServiceId) {
    const storeService = await prisma.storeService.findUnique({
      where: { id: dto.storeServiceId },
      include: {
        service: {
          include: { operator: true }
        }
      },
    });
    if (!storeService) throw new ApiError(404, 'Service not found');
    if (storeService.service.operator.stripeAccountStatus !== 'ACTIVE') {
      throw new ApiError(400, 'This service is not available for purchase (Operator not active).');
    }
    storeId = storeService.storeId;
    if (!storeId) throw new ApiError(400, 'This service is not assigned to any store');
    operatorId = storeService.service.operatorId;
    price = Number(storeService.service.basePrice);
  } else if (dto.storeBundleId) {
    const storeBundle = await prisma.storeBundle.findUnique({
      where: { id: dto.storeBundleId },
      include: {
        bundle: {
          include: { operator: true }
        }
      },
    });
    if (!storeBundle) throw new ApiError(404, 'Bundle not found');
    storeId = storeBundle.storeId;
    if (!storeId) throw new ApiError(400, 'This bundle is not assigned to any store');
    operatorId = storeBundle.bundle.operatorId;
    price = Number(storeBundle.bundle.bundlePrice);
  } else {
    throw new ApiError(400, 'storeServiceId or storeBundleId is required.');
  }

  // Calculate price with addons
  if (dto.addonIds && dto.addonIds.length > 0) {
    const addons = await prisma.addon.findMany({
      where: { id: { in: dto.addonIds } }
    });
    const addonsPrice = addons.reduce((sum, a) => sum + Number(a.price), 0);
    price += addonsPrice;
  }

  console.log(cart.id, storeId, operatorId, dto.storeServiceId, dto.storeBundleId, dto.quantity, price);

  const result = await prisma.cartItem.upsert({
    where: dto.storeServiceId
      ? { cartId_storeServiceId: { cartId: cart.id, storeServiceId: dto.storeServiceId } }
      : { cartId_storeBundleId: { cartId: cart.id, storeBundleId: dto.storeBundleId! } },
    create: {
      cartId: cart.id,
      storeId,
      operatorId,
      storeServiceId: dto.storeServiceId,
      storeBundleId: dto.storeBundleId,
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
