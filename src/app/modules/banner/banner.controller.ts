import { Request, Response } from "express";
import { BannerService } from "./banner.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.createBanner(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Banner created successfully",
    data: result,
  });
});

const getAllBanners = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getAllBanners();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Banners retrieved successfully",
    data: result,
  });
});

const getBannerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BannerService.getBannerById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Banner retrieved successfully",
    data: result,
  });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BannerService.updateBanner(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Banner updated successfully",
    data: result,
  });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BannerService.deleteBanner(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Banner deleted successfully",
    data: result,
  });
});

export const BannerController = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
