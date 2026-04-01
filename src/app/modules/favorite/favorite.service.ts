

import ApiError from "../../../errors/ApiError.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import { IFavoriteCreatePayload } from "./favorite.interface.js";
import httpStatus from "http-status";

const addFavorite = async (userId: string, payload: IFavoriteCreatePayload) => {
  const existing = await prisma.favoriteService.findUnique({
    where: {
      userId_serviceId: {
        userId,
        serviceId: payload.serviceId,
      },
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Service already favorited");
  }

  const result = await prisma.favoriteService.create({
    data: {
      userId,
      serviceId: payload.serviceId,
    },
  });

  return result;
};

const removeFavorite = async (userId: string, serviceId: string) => {
  const result = await prisma.favoriteService.delete({
    where: {
      userId_serviceId: {
        userId,
        serviceId,
      },
    },
  });

  return result;
};

const getMyFavorites = async (userId: string) => {
  const result = await prisma.favoriteService.findMany({
    where: { userId },
    include: {
      service: {
        include: {
          category: true,
          operator: {
            include: {
              user: {
                select: { name: true, avatar: true },
              },
            },
          },
        },
      },
    },
  });

  return result;
};

export const FavoriteService = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
};
