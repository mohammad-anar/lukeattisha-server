import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AddonService } from './addon.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from 'helpers.ts/prisma.js';
import ApiError from 'errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body)
  const operatorIdUserId = req.user?.id;
  console.log(operatorIdUserId)
  const operator = await prisma.operator.findUnique({
    where: { userId: operatorIdUserId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }


  const result = await AddonService.create({ ...req.body, operatorId: operator.id });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Addon created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AddonService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const operatorIdUserId = req.user?.id;
  const operator = await prisma.operator.findUnique({
    where: { userId: operatorIdUserId },
  });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }

  const filters = pick(req.query, ['searchTerm', 'isActive', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await AddonService.getByOperatorId(operator.id, filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addon updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddonService.deleteById(req.params.id as string);
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
  getByOperatorId,
};
