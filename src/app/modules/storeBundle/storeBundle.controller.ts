import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { StoreBundleService } from './storeBundle.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const operator = await prisma.operator.findUnique({
    where: { userId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }
  const result = await StoreBundleService.create(operator.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'StoreBundle created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status', 'categoryId', 'userLat', 'userLng']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StoreBundleService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllByStoreId = catchAsync(async (req: Request, res: Response) => {
  const storeId = req.params.storeId as string;
  const result = await StoreBundleService.getAllByStoreId(storeId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle fetched successfully',
    data: result,
  });
});

const getAllByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const operatorId = req.params.operatorId as string;
  const result = await StoreBundleService.getAllByOperatorId(operatorId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreBundleService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreBundleService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreBundleService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreBundle deleted successfully',
    data: result,
  });
});

export const StoreBundleController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getAllByStoreId,
  getAllByOperatorId,
};
