import { prisma } from "../../../helpers.ts/prisma.js";
import {
  IAddonCreatePayload,
  IAddonFilterRequest,
  IAddonUpdatePayload,
} from "./addon.interface.js";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError.js";
import { Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpers.ts/paginationHelper.js";
import { IPaginationOptions } from "../../../types/pagination.js";


const createAddon = async (userId: string, payload: IAddonCreatePayload) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const result = await prisma.addon.create({
    data: {
      ...payload,
      operatorId: profile.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
      operatorId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      operator: true,
    }
  });

  return result;
};

const getAllAddons = async (filter: IAddonFilterRequest, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = filter;
  const conditions: Prisma.AddonWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (minPrice) {
    conditions.push({
      price: { gte: parseFloat(minPrice) },
    });
  }

  if (maxPrice) {
    conditions.push({
      price: { lte: parseFloat(maxPrice) },
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

  const result = await prisma.addon.findMany({
    where,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder } : { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      operatorId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      operator: true,
    }
  });

  const total = await prisma.addon.count({ where });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result,
  };
};

const getMyAddons = async (userId: string, filter: IAddonFilterRequest, options: IPaginationOptions) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  // merge operatorId into filter
  return getAllAddons({ ...filter, operatorId: profile.id }, options);
};


const getAddonById = async (id: string) => {
  const result = await prisma.addon.findUnique({
    where: { id },
    include: {
      operator: true
    }
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Addon not found");
  }

  return result;
};

const updateAddon = async (userId: string, id: string, payload: IAddonUpdatePayload) => {
  const profile = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");
  }

  const addon = await getAddonById(id);
  if (addon.operatorId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access to this addon");
  }

  const result = await prisma.addon.update({
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

  const addon = await getAddonById(id);
  if (addon.operatorId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access to this addon");
  }

  const result = await prisma.addon.delete({
    where: { id },
  });

  return result;
};

export const AddonModule = {
  createAddon,
  getAllAddons,
  getMyAddons,
  getAddonById,
  updateAddon,
  deleteAddon,
};
