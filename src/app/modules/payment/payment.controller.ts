import { Request, Response } from "express";
import { PaymentService } from "./payment.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId, method, transactionId } = req.body;
  const result = await PaymentService.createPayment(orderId, method, transactionId);
  sendResponse(res, { success: true, statusCode: 201, message: "Payment recorded successfully", data: result });
});

const getPaymentsByOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentsByOrder(req.params.orderId as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Payments retrieved", data: result });
});

const getMyPaymentCards = catchAsync(async (req: any, res: Response) => {
  const result = await PaymentService.getMyPaymentCards(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Payment cards retrieved", data: result });
});

const addPaymentCard = catchAsync(async (req: any, res: Response) => {
  const result = await PaymentService.addPaymentCard(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Payment card added", data: result });
});

const setDefaultCard = catchAsync(async (req: any, res: Response) => {
  const result = await PaymentService.setDefaultCard(req.user.id, req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Default card updated", data: result });
});

const deletePaymentCard = catchAsync(async (req: any, res: Response) => {
  const result = await PaymentService.deletePaymentCard(req.user.id, req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Payment card deleted", data: result });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();
  sendResponse(res, { success: true, statusCode: 200, message: "All payments retrieved", data: result });
});

export const PaymentController = {
  createPayment,
  getPaymentsByOrder,
  getMyPaymentCards,
  addPaymentCard,
  setDefaultCard,
  deletePaymentCard,
  getAllPayments,
};
