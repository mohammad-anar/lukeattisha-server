import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { UserSubscriptionService } from './userSubscription.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'UserSubscription created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserSubscriptionService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserSubscription fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserSubscription fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserSubscription updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserSubscription deleted successfully',
    data: result,
  });
});

export const UserSubscriptionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
