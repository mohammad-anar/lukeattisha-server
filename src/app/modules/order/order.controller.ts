import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { OrderService } from "./order.service.js";

const createOrder = catchAsync(async (req: any, res: Response) => {
  const result = await OrderService.createOrder(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Order placed successfully", data: result });
});

const getMyOrders = catchAsync(async (req: any, res: Response) => {
  const result = await OrderService.getMyOrders(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Orders retrieved successfully", data: result });
});

const getOperatorOrders = catchAsync(async (req: any, res: Response) => {
  const result = await OrderService.getOperatorOrders(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Orders retrieved successfully", data: result });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderById(req.params.id as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Order retrieved successfully", data: result });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(req.params.id as string, req.body);
  sendResponse(res, { success: true, statusCode: 200, message: "Order status updated", data: result });
});

const cancelOrder = catchAsync(async (req: any, res: Response) => {
  const result = await OrderService.cancelOrder(req.user.id, req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Order cancelled", data: result });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders();
  sendResponse(res, { success: true, statusCode: 200, message: "All orders retrieved", data: result });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getOperatorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
