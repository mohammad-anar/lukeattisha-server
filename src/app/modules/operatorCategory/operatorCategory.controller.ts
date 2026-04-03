import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorCategoryService } from './operatorCategory.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OperatorCategory created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorCategory updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorCategoryService.deleteById(req.params.id);
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
