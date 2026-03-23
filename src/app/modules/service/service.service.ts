

import { prisma } from "helpers.ts/prisma.js";
import {
  IServiceCreatePayload,
  IServiceUpdatePayload,
  IAddonCreatePayload,
  IAddonUpdatePayload,
} from "./service.interface.js";
import httpStatus from "http-status";
import ApiError from "errors/ApiError.js";

const createService = async (userId: string, payload: IServiceCreatePayload) => {
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

const getServicesByOperator = async (operatorId: string) => {
  const result = await prisma.service.findMany({
    where: { operatorId },
    include: {
      addons: true,
      category: true,
    },
  });
  return result;
};

const getServiceById = async (id: string, operatorId?: string) => {
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

const updateService = async (userId: string, id: string, payload: IServiceUpdatePayload) => {
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

const deleteService = async (userId: string, id: string) => {
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

const createAddon = async (userId: string, serviceId: string, payload: IAddonCreatePayload) => {
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

const updateAddon = async (userId: string, id: string, payload: IAddonUpdatePayload) => {
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

  if (!addon) throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
  if (addon.service.operatorId !== profile.id) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");

  const result = await prisma.addonService.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAddon = async (userId: string, id: string) => {
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

  if (!addon) throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
  if (addon.service.operatorId !== profile.id) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");

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
