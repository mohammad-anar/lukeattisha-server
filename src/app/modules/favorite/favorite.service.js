import ApiError from "src/errors/ApiError.js";
import httpStatus from "http-status";
import { prisma } from "src/helpers.ts/prisma.js";
const addFavorite = async (userId, payload) => {
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
const removeFavorite = async (userId, serviceId) => {
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
const getMyFavorites = async (userId) => {
    const result = await prisma.favoriteService.findMany({
        where: { userId },
        include: {
            service: {
                include: {
                    category: true,
                    addons: true,
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
