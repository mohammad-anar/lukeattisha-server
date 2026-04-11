import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OrderIssueService } from './orderIssue.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await OrderIssueService.create({ ...req.body, userId });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Order issue reported successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderIssueService.getAll(req.query, req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order issues fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderIssueService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order issue fetched successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderIssueService.updateStatus(req.params.id as string, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order issue status updated successfully',
    data: result,
  });
});

export const OrderIssueController = {
  create,
  getAll,
  getById,
  updateStatus,
};
