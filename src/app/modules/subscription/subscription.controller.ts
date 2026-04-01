import { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";
import httpStatus from "http-status";

/* ================= PACKAGE MANAGEMENT (ADMIN) ================= */

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.createPackage(req.body);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.CREATED, 
    message: "Package created successfully", 
    data: result 
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllPackages();
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Packages retrieved", 
    data: result 
  });
});

const getPackageById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getPackageById(req.params.id as string);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Package retrieved", 
    data: result 
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updatePackage(req.params.id as string, req.body);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Package updated", 
    data: result 
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deletePackage(req.params.id as string);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Package deleted", 
    data: result 
  });
});

/* ================= SUBSCRIPTION OPERATIONS ================= */

/**
 * INITIATE PAYMENT: 
 * This is the ONLY entry point for a user to start a subscription.
 * Returns the Stripe Checkout URL.
 */
const createSubscriptionSession = catchAsync(async (req: any, res: Response) => {
  const result = await SubscriptionService.createSubscriptionSession(req.user.id, req.body);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Subscription session created", 
    data: result 
  });
});

const getMySubscription = catchAsync(async (req: any, res: Response) => {
  const result = await SubscriptionService.getMySubscription(req.user.id);
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "Subscription retrieved", 
    data: result 
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllSubscriptions();
  sendResponse(res, { 
    success: true, 
    statusCode: httpStatus.OK, 
    message: "All subscriptions retrieved", 
    data: result 
  });
});

export const SubscriptionController = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  createSubscriptionSession,
  getMySubscription,
  getAllSubscriptions,
};