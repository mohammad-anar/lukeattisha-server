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
    message: 'User subscription created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'userId', 'status', 'planId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserSubscriptionService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User subscriptions fetched successfully',
    meta: (result as any).meta,
    data: (result as any).data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User subscription fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User subscription updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserSubscriptionService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User subscription deleted successfully',
    data: result,
  });
});

const activateIAP = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserSubscriptionService.activateIAP(user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Subscription activated successfully via IAP',
    data: result,
  });
});

export const UserSubscriptionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  activateIAP,
};
