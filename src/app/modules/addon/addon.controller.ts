import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AddonService } from './addon.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Addon created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon deleted successfully',
    data: result,
  });
});

export const AddonController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
