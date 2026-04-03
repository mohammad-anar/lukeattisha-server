import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ServiceService } from './service.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Service created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ServiceService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service deleted successfully',
    data: result,
  });
});

export const ServiceController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
