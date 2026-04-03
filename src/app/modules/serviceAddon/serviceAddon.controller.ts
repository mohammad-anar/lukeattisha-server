import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ServiceAddonService } from './serviceAddon.service.js';

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
  const result = await ServiceAddonService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ServiceAddon fetched successfully',
    data: result,
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
