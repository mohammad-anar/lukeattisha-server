import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ServiceService } from './service.service.js';
import pick from '../../../helpers.ts/pick.js';
import { getSingleFilePath } from '../../shared/getFilePath.js';
import { config } from '../../../config/index.js';
import ApiError from 'errors/ApiError.js';
import { prisma } from 'helpers.ts/prisma.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image");
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  const result = await ServiceService.create(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Service created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status', 'userLat', 'userLng']);
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
  const result = await ServiceService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service fetched successfully',
    data: result,
  });
});

const getByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getByOperatorId(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image");
  if (image) {
    payload.image = `http://${config.ip_address}:${config.port}${image}`;
  }

  console.log(payload);

  const result = await ServiceService.update(req.params.id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service updated successfully',
    data: result,
  });
});

const assignAddons = catchAsync(async (req: Request, res: Response) => {
  const operatorIdUserId = (req as any).user?.id;
  const operator = await prisma.operator.findUnique({
    where: { userId: operatorIdUserId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }
  const payload = req.body;
  const result = await ServiceService.assignAddons(operator.id, payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addons assigned successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.deleteById(req.params.id as string);
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
  getByOperatorId,
  update,
  assignAddons,
  deleteById,
};
