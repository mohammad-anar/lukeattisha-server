import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import { ICartAddPayload, ICartUpdatePayload } from "./cart.interface.js";

const getMyCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          service: true,
          serviceBundle: {
            include: {
              services: {
                include: { service: true }
              }
            }
          },
          addons: {
            include: {
              addon: true,
            },
          },
        },
      },
    },
  });

  // If cart doesn't exist, create it
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            service: true,
            serviceBundle: {
              include: {
                services: {
                  include: { service: true }
                }
              }
            },
            addons: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

const addToCart = async (userId: string, payload: ICartAddPayload) => {
  const { serviceId, serviceBundleId, quantity = 1, addons = [] } = payload;

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const result = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      serviceId,
      serviceBundleId,
      quantity,
      addons: {
        create: addons.map((addonId) => ({
          addonId,
        })),
      },
    },
    include: {
      service: true,
      serviceBundle: {
        include: {
          services: {
            include: { service: true }
          }
        }
      },
      addons: {
        include: {
          addon: true,
        },
      },
    },
  });

  return result;
};

const updateCartItem = async (userId: string, cartItemId: string, payload: ICartUpdatePayload) => {
  const { quantity, addons } = payload;

  // Verify ownership via cart relation
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId },
    },
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const updateData: any = {};
  if (quantity !== undefined) {
    updateData.quantity = quantity;
  }

  if (addons !== undefined) {
    // Replace addons: delete all existing and create new ones
    await prisma.cartItemAddon.deleteMany({
      where: { cartItemId },
    });

    updateData.addons = {
      create: addons.map((addonId) => ({
        addonId,
      })),
    };
  }

  const result = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: updateData,
    include: {
      service: true,
      serviceBundle: true,
      addons: {
        include: {
          addon: true,
        },
      },
    },
  });

  return result;
};

const removeFromCart = async (userId: string, cartItemId: string) => {
  // Verify ownership via cart relation
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId },
    },
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return null;
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return null;
};

export const CartService = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
