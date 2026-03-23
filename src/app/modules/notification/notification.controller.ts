import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { NotificationService } from "./notification.service.js";

const getMyNotifications = catchAsync(async (req: any, res: Response) => {
  const result = await NotificationService.getMyNotifications(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Notifications retrieved", data: result });
});

const markAsSent = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAsSent(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Notification marked as sent", data: result });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.deleteNotification(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Notification deleted", data: result });
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getAllNotifications();
  sendResponse(res, { success: true, statusCode: 200, message: "All notifications retrieved", data: result });
});

export const NotificationController = {
  getMyNotifications,
  markAsSent,
  deleteNotification,
  getAllNotifications,
};
