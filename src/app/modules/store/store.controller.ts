import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { StoreService } from './store.service.js';
import pick from '../../../helpers.ts/pick.js';
import { getSingleFilePath } from 'app/shared/getFilePath.js';
import { config } from 'config/index.js';
import { prisma } from 'helpers.ts/prisma.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const operator = await prisma.operator.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!operator) {
    throw new Error('Operator not found');
  }
  const image = getSingleFilePath(req.files, "image");
  const banner = getSingleFilePath(req.files, "banner");

  const payload = req.body;

  if (image) payload.logo = `http://${config.ip_address}:${config.port}${image}`;
  if (banner) payload.banner = `http://${config.ip_address}:${config.port}${banner}`;

  const result = await StoreService.create({ ...payload, operatorId: operator.id });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Store created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status', 'userLat', 'userLng']); // Customize filters as needed
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

const getByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const operatorId = req.params.operatorId as string;
  const operator = await prisma.operator.findUnique({
    where: {
      id: operatorId,
    },
  });
  if (!operator) {
    throw new Error('Operator not found');
  }
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status', 'userLat', 'userLng']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StoreService.getByOperatorId(filters, options, operator.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Store updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.deleteById(req.params.id as string);
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
  getByOperatorId
};
