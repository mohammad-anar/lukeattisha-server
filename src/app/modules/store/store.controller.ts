import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { StoreService } from './store.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Store created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StoreService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store deleted successfully',
    data: result,
  });
});

export const StoreController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
