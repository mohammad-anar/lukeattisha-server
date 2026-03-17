import prisma from "src/app/shared/prisma.js";
import ApiError from "src/app/errors/ApiError.js";
import httpStatus from "http-status";
const createOperatorProfile = async (userId, payload) => {
    const existingProfile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (existingProfile) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Operator profile already exists");
    }
    const result = await prisma.operatorProfile.create({
        data: {
            userId,
            ...payload,
        },
    });
    return result;
};
const getOperatorProfile = async (userId) => {
    const result = await prisma.operatorProfile.findUnique({
        where: { userId },
        include: {
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    return result;
};
const getAllOperators = async () => {
    const result = await prisma.operatorProfile.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                },
            },
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
    return result;
};
const getOperatorById = async (id) => {
    const result = await prisma.operatorProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                },
            },
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    return result;
};
const updateOperatorProfile = async (userId, payload) => {
    await getOperatorProfile(userId);
    const result = await prisma.operatorProfile.update({
        where: { userId },
        data: payload,
    });
    return result;
};
const assignCategories = async (userId, payload) => {
    const profile = await getOperatorProfile(userId);
    // Clear existing categories
    await prisma.operatorCategory.deleteMany({
        where: { operatorId: profile.id },
    });
    // Assign new categories
    const newAssignments = payload.categoryIds.map((categoryId) => ({
        operatorId: profile.id,
        categoryId,
    }));
    await prisma.operatorCategory.createMany({
        data: newAssignments,
    });
    return await getOperatorProfile(userId);
};
export const OperatorService = {
    createOperatorProfile,
    getOperatorProfile,
    getAllOperators,
    getOperatorById,
    updateOperatorProfile,
    assignCategories,
};
