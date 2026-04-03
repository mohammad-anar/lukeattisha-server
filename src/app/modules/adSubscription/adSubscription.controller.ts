import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdSubscriptionService } from './adSubscription.service.js';

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
  const result = await AdSubscriptionService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdSubscriptionService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdSubscription deleted successfully',
    data: result,
  });
});

export const AdSubscriptionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
