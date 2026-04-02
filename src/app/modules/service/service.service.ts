

import { prisma } from "helpers.ts/prisma.js";
import {
  IServiceCreatePayload,
  IServiceUpdatePayload,
  IAssignAddonPayload,
  IServiceFilterRequest,
} from "./service.interface.js";
import httpStatus from "http-status";
import ApiError from "errors/ApiError.js";
import { Prisma } from "@prisma/client";
import { paginationHelper } from "helpers.ts/paginationHelper.js";
import { IPaginationOptions } from "types/pagination.js";


const createService = async (userId: string, payload: IServiceCreatePayload) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const { addons, ...serviceData } = payload;

  const result = await prisma.service.create({
    data: {
      ...serviceData,
      operatorId: profile.id,
      ...(addons ? {
        addons: {
          create: addons.map(addonId => ({
            addonId,
          }))
        }
      } : {})
    },
  });

  return result;
};

// get all services 
const getAllServices = async (filter: IServiceFilterRequest, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = filter;
  const conditions: Prisma.ServiceWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (minPrice) {
    conditions.push({
      basePrice: { gte: parseFloat(minPrice) },
    });
  }

  if (maxPrice) {
    conditions.push({
      basePrice: { lte: parseFloat(maxPrice) },
    });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (key === "isActive") {
          return { [key]: (filterData as any)[key] === "true" };
        }
        return { [key]: { equals: (filterData as any)[key] } };
      }),
    });
  }

  const where = { AND: conditions };

  const result = await prisma.service.findMany({
    where,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder } : { createdAt: "desc" },
    include: {
      addons: {
        include: {
          addon: true,
        },
      },
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

  const total = await prisma.service.count({ where });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result,
  };
};


const getServicesByOperator = async (operatorId: string) => {
  const operator = await prisma.operatorProfile.findUnique({
    where: { userId: operatorId },
  });
  if (!operator) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }
  const result = await prisma.service.findMany({
    where: { operatorId: operator.id },
    include: {
      addons: {
        include: {
          addon: true,
        },
      },
      category: true,
    },
  });
  return result;
};

const getServiceById = async (id: string, operatorId?: string) => {
  const result = await prisma.service.findUnique({
    where: { id },
    include: {
      addons: {
        include: {
          addon: true,
        },
      },
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

  const { addons, ...serviceData } = payload;

  const result = await prisma.service.update({
    where: { id },
    data: {
      ...serviceData,
      ...(addons ? {
        addons: {
          deleteMany: {},
          create: addons.map(addonId => ({
             addonId,
          }))
        }
      } : {})
    },
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

const createAddon = async (userId: string, serviceId: string, payload: { addonIds: string[] }) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  // verify service ownership
  const service = await getServiceById(serviceId, profile.id);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  const addonData = payload.addonIds.map(addonId => ({
    addonId,
    serviceId,
  }))

  const result = await prisma.addonService.createMany({
    data: addonData,
  });

  return result;
};

// get addons by id 
const getAddonById = async (id: string) => {
  const result = await prisma.addonService.findUnique({
    where: { id },
    include: {
      addon: true,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
  }
  return result;
};

// get addons by service id 
const getAddonsByServiceId = async (serviceId: string) => {
  const result = await prisma.addonService.findMany({
    where: { serviceId },
    include: {
      addon: true,
    },
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

  const addonRelation = await prisma.addonService.findUnique({
    where: { id },
    include: {
      service: true,
      addon: true,
    }
  });

  if (!addonRelation) throw new ApiError(httpStatus.NOT_FOUND, "Addon association not found");
  if (addonRelation.service.operatorId !== profile.id) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");

  const result = await prisma.addonService.delete({
    where: { id },
  });

  return result;
};

export const ServiceModule = {
  createService,
  getAllServices,
  getServicesByOperator,
  getServiceById,
  updateService,
  deleteService,
  createAddon,
  getAddonById,
  getAddonsByServiceId,
  deleteAddon,
};
