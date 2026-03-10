import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { AnalyticsService } from "./analytics.service.js";

const getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await AnalyticsService.getUserAnalytics(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User analytics retrieved successfully",
    data: result,
  });
});

const getWorkshopAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await AnalyticsService.getWorkshopAnalytics(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workshop analytics retrieved successfully",
    data: result,
  });
});

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAdminAnalytics();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin analytics retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getUserAnalytics,
  getWorkshopAnalytics,
  getAdminAnalytics,
};
