import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorCategoryService } from './operatorCategory.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from 'helpers.ts/prisma.js';
import ApiError from 'errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const operatorId = req.user?.id;
  const categoryIds = req.body.categoryIds;
  const result = await OperatorCategoryService.create({ operatorId, categoryIds });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OperatorCategory created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const operatorId = req.params.operatorId as string;
  const operator = await prisma.operator.findUnique({
    where: { id: operatorId }
  })
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }
  const result = await OperatorCategoryService.getAll(operator?.userId, filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const operatorId = req.user?.id;
  const operatorCategoryId = req.params.id as string;
  const result = await OperatorCategoryService.update(operatorId, operatorCategoryId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory deleted successfully',
    data: result,
  });
});

export const OperatorCategoryController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
