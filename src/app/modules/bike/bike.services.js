import ApiError from "src/errors/ApiError.js";
import { prisma } from "src/helpers.ts/prisma.js";
const createBike = async (payload) => {
    const result = await prisma.bike.create({ data: payload });
    return result;
};
// const getAllBikes = async () => {};
const getBikeById = async (id, userId) => {
    const bike = await prisma.bike.findUnique({ where: { id, ownerId: userId } });
    if (!bike) {
        throw new ApiError(403, "You can't get others bike!");
    }
    const result = await prisma.bike.findUnique({ where: { id } });
    if (!result) {
        throw new ApiError(404, "Bike not found!");
    }
    return result;
};
const getBikesByUserId = async (userId) => {
    const result = await prisma.bike.findMany({
        where: {
            ownerId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
const updateBike = async (id, payload, userId) => {
    const bike = await prisma.bike.findUnique({
        where: { id, ownerId: userId },
    });
    if (!bike) {
        throw new ApiError(403, "You can't update others bike!");
    }
    const result = await prisma.bike.update({ where: { id }, data: payload });
    return result;
};
const deleteBike = async (id, userId) => {
    const bike = await prisma.bike.findUnique({
        where: { id, ownerId: userId },
    });
    if (!bike) {
        throw new ApiError(403, "You can't delete others bike!");
    }
    const result = await prisma.bike.delete({ where: { id } });
    return result;
};
export const BikeService = {
    createBike,
    getBikeById,
    getBikesByUserId,
    updateBike,
    deleteBike,
};
