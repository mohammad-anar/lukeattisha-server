import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { BannerType, Prisma } from '@prisma/client';

export type BannerCreatePayload = {
  title: string;
  description?: string;
  image?: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
  bannerType?: BannerType;
  isActive?: boolean;
};

export type BannerUpdatePayload = Partial<BannerCreatePayload>;

const BANNER_SEARCH_FIELDS = ['title', 'description', 'buttonText'];
const BANNER_FILTER_FIELDS = ['bannerType', 'isActive'];

const create = async (payload: BannerCreatePayload) => {
  const result = await prisma.banner.create({
    data: payload,
  });
  return result;
};

const getAll = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.BannerWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: BANNER_SEARCH_FIELDS.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals:
            key === 'isActive'
              ? filterData[key] === 'true' || filterData[key] === true
              : filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.BannerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await prisma.$transaction([
    prisma.banner.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    }),
    prisma.banner.count({ where: whereConditions }),
  ]);

  return {
    meta: { total, page, limit },
    data: result,
  };
};

const getActiveBanners = async () => {
  const result = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.banner.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(404, 'Banner not found');
  }
  return result;
};

const update = async (id: string, payload: BannerUpdatePayload) => {
  await getById(id);
  const result = await prisma.banner.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  await getById(id);
  const result = await prisma.banner.delete({
    where: { id },
  });
  return result;
};

export const BannerService = {
  create,
  getAll,
  getActiveBanners,
  getById,
  update,
  deleteById,
};
