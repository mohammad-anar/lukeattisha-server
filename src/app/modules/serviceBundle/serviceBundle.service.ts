import { prisma } from "helpers.ts/prisma.js";
import {
  IServiceBundleCreatePayload,
  IServiceBundleUpdatePayload,
  IServiceBundleFilterRequest,
} from "./serviceBundle.interface.js";
import httpStatus from "http-status";
import ApiError from "errors/ApiError.js";
import { Prisma } from "@prisma/client";
import { paginationHelper } from "helpers.ts/paginationHelper.js";
import { IPaginationOptions } from "types/pagination.js";


const enrichBundle = (bundle: any) => {
  const totalOriginalPrice = bundle.services.reduce(
    (acc: number, item: any) => acc + Number(item.service.basePrice),
    0
  );
  const bundlePrice = Number(bundle.bundlePrice);
  const discountAmount = totalOriginalPrice - bundlePrice;
  const discountPercentage =
    totalOriginalPrice > 0 ? (discountAmount / totalOriginalPrice) * 100 : 0;

  return {
    ...bundle,
    totalOriginalPrice: Number(totalOriginalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercentage: Number(discountPercentage.toFixed(2)),
  };
};

const createServiceBundle = async (
  userId: string,
  payload: IServiceBundleCreatePayload
) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const { serviceIds, ...bundleData } = payload;

  const result = await prisma.serviceBundle.create({
    data: {
      ...bundleData,
      operatorId: profile.id,
      services: {
        create: serviceIds.map((id) => ({ serviceId: id })),
      },
    },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  return enrichBundle(result);
};

const getAllServiceBundles = async (
  filter: IServiceBundleFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;
  const conditions: Prisma.ServiceBundleWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const where = { AND: conditions };

  const bundles = await prisma.serviceBundle.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      operator: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  const total = await prisma.serviceBundle.count({ where });

  const enrichedData = bundles.map(enrichBundle);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: enrichedData,
  };
};

const getServiceBundleById = async (id: string) => {
  const bundle = await prisma.serviceBundle.findUnique({
    where: { id },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      operator: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!bundle) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service bundle not found");
  }

  return enrichBundle(bundle);
};

const updateServiceBundle = async (
  userId: string,
  id: string,
  payload: IServiceBundleUpdatePayload
) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const existingBundle = await prisma.serviceBundle.findUnique({
    where: { id },
  });

  if (!existingBundle || existingBundle.operatorId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access to this bundle");
  }

  const { serviceIds, ...bundleData } = payload;

  const result = await prisma.serviceBundle.update({
    where: { id },
    data: {
      ...bundleData,
      services: serviceIds
        ? {
            deleteMany: {},
            create: serviceIds.map((id) => ({ serviceId: id })),
          }
        : undefined,
    },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  return enrichBundle(result);
};

const deleteServiceBundle = async (userId: string, id: string) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const existingBundle = await prisma.serviceBundle.findUnique({
    where: { id },
  });

  if (!existingBundle || existingBundle.operatorId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access to this bundle");
  }

  await prisma.serviceBundle.delete({
    where: { id },
  });

  return { message: "Service bundle deleted successfully" };
};

export const ServiceBundleModule = {
  createServiceBundle,
  getAllServiceBundles,
  getServiceBundleById,
  updateServiceBundle,
  deleteServiceBundle,
};
