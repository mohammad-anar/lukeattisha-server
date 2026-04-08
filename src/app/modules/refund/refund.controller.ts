import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { RefundService } from './refund.service.js';

const requestRefund = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await RefundService.requestRefund(user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Refund requested successfully',
    data: result,
  });
});

const processRefundByOperator = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { action } = req.body;
  const result = await RefundService.processRefundByOperator(user.id, id as string, action as 'APPROVE' | 'REJECT' | 'ESCALATE');
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Refund request processed by operator',
    data: result,
  });
});

const processRefundByAdmin = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { action, partialAmount } = req.body;
  const result = await RefundService.processRefundByAdmin(user.id, id as string, action as 'APPROVE' | 'REJECT', partialAmount);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Refund request processed by admin',
    data: result,
  });
});

export const RefundController = {
  requestRefund,
  processRefundByOperator,
  processRefundByAdmin
};
