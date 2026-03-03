import { Prisma } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import {
  IPaginationOptions,
  IUserFilterRequest,
} from "src/types/pagination.js";
import { ICreateWorkshop } from "./workshop.interfaces.js";

// create workshop ================================
const createWorkshop = async (payload: Prisma.WorkshopCreateInput) => {
  const workshop = await prisma.workshop.create({
    data: {
      ...payload,
      isVerified: true,
    },
  });

  return workshop;
};

// get all workshops ===============================================
const getAllWorkshops = async (
  params: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.WorkshopWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["workshopName", "ownerName", "address", "description"].map(
        (field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        }),
      ),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.WorkshopWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.workshop.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },

    include: {
      bookings: true,
      categories: true,
      invoices: true,
      jobs: true,
      workshopOpeningHours: true,
    },
  });

  const total = await prisma.workshop.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const WorkshopService = {
  createWorkshop,
  getAllWorkshops,
};
