import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdService } from './ad.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const operator = await prisma.operator.findUnique({ where: { userId: user.id } });
  if (!operator) throw new ApiError(404, 'Operator not found');
  const result = await AdService.create({ ...req.body, operatorId: operator.id });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Ad created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status', 'userLat', 'userLng']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AdService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad deleted successfully',
    data: result,
  });
});

const getMyActiveAd = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const operator = await prisma.operator.findUnique({ where: { userId: user.id } });
  if (!operator) throw new ApiError(404, 'Operator not found');
  
  const result = await AdService.getMyActiveAd(operator.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Active ad fetched successfully',
    data: result,
  });
});

const deleteMyActiveAd = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const operator = await prisma.operator.findUnique({ where: { userId: user.id } });
  if (!operator) throw new ApiError(404, 'Operator not found');
  
  const result = await AdService.deleteMyActiveAd(operator.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Active ad deleted successfully',
    data: result,
  });
});

export const AdController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getMyActiveAd,
  deleteMyActiveAd,
};

