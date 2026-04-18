import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdSubscriptionService } from './adSubscription.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdSubscription created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AdSubscriptionService.getAll(filters, options, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.getById(req.params.id as string, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.update(req.params.id as string, req.body, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.deleteById(req.params.id as string, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription deleted successfully',
    data: result,
  });
});

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const operator = await prisma.operator.findUnique({ where: { userId: id } });
  if (!operator) throw new ApiError(404, 'Operator not found');
  const result = await AdSubscriptionService.createCheckoutSession(operator.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription checkout session created',
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.cancelSubscription(req.params.id as string, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription cancelled successfully',
    data: result,
  });
});

export const AdSubscriptionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  createCheckoutSession,
  cancelSubscription,
};
