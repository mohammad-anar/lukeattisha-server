import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { StoreServiceService } from './storeService.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'StoreService created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
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

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'StoreService updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServiceService.deleteById(req.params.id);
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
};
