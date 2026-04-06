import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { StoreServiceService } from './storeService.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from 'helpers.ts/prisma.js';
import ApiError from 'errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const operator = await prisma.operator.findUnique({
    where: { userId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }
  const result = await StoreServiceService.create(operator.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'StoreService created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status', 'categoryId', 'userLat', 'userLng']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StoreServiceService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllByStoreId = catchAsync(async (req: Request, res: Response) => {
  const storeId = req.params.storeId as string;
  const result = await StoreServiceService.getAllByStoreId(storeId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService fetched successfully',
    data: result,
  });
});

const getAllByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const operatorId = req.params.operatorId as string;
  const result = await StoreServiceService.getAllByOperatorId(operatorId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService deleted successfully',
    data: result,
  });
});

export const StoreServiceController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getAllByStoreId,
  getAllByOperatorId,
};
