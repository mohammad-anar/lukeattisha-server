import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { BundleService } from './bundle.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Bundle created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle deleted successfully',
    data: result,
  });
});

export const BundleController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
