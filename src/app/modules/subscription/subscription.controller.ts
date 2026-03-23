import { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.createPackage(req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Package created successfully", data: result });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllPackages();
  sendResponse(res, { success: true, statusCode: 200, message: "Packages retrieved", data: result });
});

const getPackageById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getPackageById(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Package retrieved", data: result });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updatePackage(req.params.id as string, req.body);
  sendResponse(res, { success: true, statusCode: 200, message: "Package updated", data: result });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deletePackage(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Package deleted", data: result });
});

const subscribe = catchAsync(async (req: any, res: Response) => {
  const result = await SubscriptionService.subscribe(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Subscribed successfully", data: result });
});

const getMySubscription = catchAsync(async (req: any, res: Response) => {
  const result = await SubscriptionService.getMySubscription(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Subscription retrieved", data: result });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllSubscriptions();
  sendResponse(res, { success: true, statusCode: 200, message: "All subscriptions retrieved", data: result });
});

export const SubscriptionController = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  subscribe,
  getMySubscription,
  getAllSubscriptions,
};
