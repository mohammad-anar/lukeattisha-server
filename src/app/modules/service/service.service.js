import ApiError from "src/errors/ApiError.js";
import httpStatus from "http-status";
import { prisma } from "src/helpers.ts/prisma.js";
const createService = async (userId, payload) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    const result = await prisma.service.create({
        data: {
            ...payload,
            operatorId: profile.id,
        },
    });
    return result;
};
const getServicesByOperator = async (operatorId) => {
    const result = await prisma.service.findMany({
        where: { operatorId },
        include: {
            addons: true,
            category: true,
        },
    });
    return result;
};
const getServiceById = async (id, operatorId) => {
    const result = await prisma.service.findUnique({
        where: { id },
        include: {
            addons: true,
            category: true,
            operator: {
                include: {
                    user: {
                        select: { name: true, email: true, phone: true }
                    }
                }
            }
        },
    });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }
    // verify ownership if operatorId is provided context
    if (operatorId && result.operatorId !== operatorId) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access to this service");
    }
    return result;
};
const updateService = async (userId, id, payload) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    await getServiceById(id, profile.id);
    const result = await prisma.service.update({
        where: { id },
        data: payload,
    });
    return result;
};
const deleteService = async (userId, id) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    await getServiceById(id, profile.id);
    const result = await prisma.service.delete({
        where: { id },
    });
    return result;
};
const createAddon = async (userId, serviceId, payload) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    // verify service ownership
    await getServiceById(serviceId, profile.id);
    const result = await prisma.addonService.create({
        data: {
            ...payload,
            serviceId,
        },
    });
    return result;
};
const updateAddon = async (userId, id, payload) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    const addon = await prisma.addonService.findUnique({
        where: { id },
        include: { service: true }
    });
    if (!addon)
        throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
    if (addon.service.operatorId !== profile.id)
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");
    const result = await prisma.addonService.update({
        where: { id },
        data: payload,
    });
    return result;
};
const deleteAddon = async (userId, id) => {
    const profile = await prisma.operatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
    }
    const addon = await prisma.addonService.findUnique({
        where: { id },
        include: { service: true }
    });
    if (!addon)
        throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
    if (addon.service.operatorId !== profile.id)
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");
    const result = await prisma.addonService.delete({
        where: { id },
    });
    return result;
};
export const ServiceModule = {
    createService,
    getServicesByOperator,
    getServiceById,
    updateService,
    deleteService,
    createAddon,
    updateAddon,
    deleteAddon,
};
