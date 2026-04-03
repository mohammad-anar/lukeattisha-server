import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ServiceAddonService } from './serviceAddon.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceAddonService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'ServiceAddon created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ServiceAddonService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ServiceAddon fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceAddonService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ServiceAddon fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceAddonService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ServiceAddon updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceAddonService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ServiceAddon deleted successfully',
    data: result,
  });
});

export const ServiceAddonController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
