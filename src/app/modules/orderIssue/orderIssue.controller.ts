import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OrderIssueService } from './orderIssue.service.js';
import { getMultipleFilesPath } from '../../shared/getFilePath.js';
import { config } from '../../../config/index.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from 'helpers.ts/prisma.js';
import ApiError from 'errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const payload = req.body;
  
  // Handle multiple images
  const images = getMultipleFilesPath(req.files as any, "image");
  if (images && images.length > 0) {
    payload.images = images.map(img => `http://${config.ip_address}:${config.port}${img}`);
  }

  const result = await OrderIssueService.create({ ...payload, userId });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Order issue reported successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const operator = await prisma.operator.findUnique({
    where: { userId: user.id },
  });
  const filters = pick(req.query, ['searchTerm', 'status', 'isEscalated', 'orderId', 'userId', 'operatorId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  // If operator, filter by their ID
  if (user.role === 'OPERATOR') {
    filters.operatorId = operator?.id;
  }
  // If user, filter by their ID
  if (user.role === 'USER') {
    filters.userId = user.id;
  }

  const result = await OrderIssueService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order issues fetched successfully',
    meta: result.meta,
    data: result.data,
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

const respondToIssue = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const operator = await prisma.operator.findUnique({
    where: { userId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }

  const result = await OrderIssueService.respondToIssue(req.params.id as string, operator.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Response sent successfully',
    data: result,
  });
});

const resolveEscalatedIssue = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user.id;
  const result = await OrderIssueService.resolveEscalatedIssue(req.params.id as string, adminId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Issue resolved by admin',
    data: result,
  });
});

export const OrderIssueController = {
  create,
  getAll,
  getById,
  respondToIssue,
  resolveEscalatedIssue,
};
