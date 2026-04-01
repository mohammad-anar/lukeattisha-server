import httpStatus from "http-status";
import { prisma } from "helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";
import { IBannerCreatePayload, IBannerUpdatePayload } from "./banner.interface.js";

const createBanner = async (payload: IBannerCreatePayload) => {
  return await prisma.banner.create({
    data: payload,
  });
};

const getAllBanners = async () => {
  return await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getBannerById = async (id: string) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
  }
  return banner;
};

const updateBanner = async (id: string, payload: IBannerUpdatePayload) => {
  await getBannerById(id);
  return await prisma.banner.update({
    where: { id },
    data: payload,
  });
};

const deleteBanner = async (id: string) => {
  await getBannerById(id);
  return await prisma.banner.delete({
    where: { id },
  });
};

export const BannerService = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
