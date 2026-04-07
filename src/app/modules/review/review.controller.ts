import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ReviewService } from './review.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReviewService.create({ ...req.body, userId: user.id });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Review created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'operatorId', 'storeId', 'userId', 'storeServiceId', 'storeBundleId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getByOperatorId(req.params.operatorId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByUserId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getByUserId(req.params.userId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByStoreId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getByStoreId(req.params.storeId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByStoreServiceId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getByStoreServiceId(req.params.storeServiceId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByStoreBundleId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ReviewService.getByStoreBundleId(req.params.storeBundleId as string, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reviews fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Review fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  create,
  getAll,
  getById,
  getByOperatorId,
  getByUserId,
  getByStoreId,
  getByStoreServiceId,
  getByStoreBundleId,
  update,
  deleteById,
};
