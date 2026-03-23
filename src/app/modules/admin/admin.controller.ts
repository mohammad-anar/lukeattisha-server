import { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, { success: true, statusCode: 200, message: "Dashboard stats retrieved", data: result });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, { success: true, statusCode: 200, message: "Users retrieved", data: result });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await AdminService.updateUserStatus(req.params.id as string, status);
  sendResponse(res, { success: true, statusCode: 200, message: "User status updated", data: result });
});

const getAdminSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminSettings();
  sendResponse(res, { success: true, statusCode: 200, message: "Admin settings retrieved", data: result });
});

const updateAdminSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateAdminSettings(req.body);
  sendResponse(res, { success: true, statusCode: 200, message: "Settings updated", data: result });
});

const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllTickets();
  sendResponse(res, { success: true, statusCode: 200, message: "Tickets retrieved", data: result });
});

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateTicketStatus(req.params.id as string, req.body.status );
  sendResponse(res, { success: true, statusCode: 200, message: "Ticket status updated", data: result });
});

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAdminSettings,
  updateAdminSettings,
  getAllTickets,
  updateTicketStatus,
};
