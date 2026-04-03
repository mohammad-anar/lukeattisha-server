import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { BundleService } from './bundle.service.js';
import pick from '../../../helpers.ts/pick.js';
import { getSingleFilePath } from '../../shared/getFilePath.js';
import { config } from '../../../config/index.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image");
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await BundleService.create(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Bundle created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status', 'userLat', 'userLng']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await BundleService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image");
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await BundleService.update(req.params.id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bundle updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.deleteById(req.params.id as string);
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
