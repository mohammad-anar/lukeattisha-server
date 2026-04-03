import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdSubscriptionPlanService } from './adSubscriptionPlan.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionPlanService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdSubscriptionPlan created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AdSubscriptionPlanService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscriptionPlan fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionPlanService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscriptionPlan fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionPlanService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscriptionPlan updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionPlanService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscriptionPlan deleted successfully',
    data: result,
  });
});

export const AdSubscriptionPlanController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
