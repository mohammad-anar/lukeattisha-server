import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorWalletTransactionService } from './operatorWalletTransaction.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletTransactionService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OperatorWalletTransaction created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await OperatorWalletTransactionService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWalletTransaction fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletTransactionService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWalletTransaction fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletTransactionService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWalletTransaction updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletTransactionService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWalletTransaction deleted successfully',
    data: result,
  });
});

export const OperatorWalletTransactionController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
