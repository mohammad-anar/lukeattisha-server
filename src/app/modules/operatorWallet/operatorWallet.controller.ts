import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OperatorWalletService } from './operatorWallet.service.js';
import pick from '../../../helpers.ts/pick.js';
import { prisma } from 'helpers.ts/prisma.js';
import ApiError from 'errors/ApiError.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OperatorWallet created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await OperatorWalletService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByOperatorId = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const operator = await prisma.operator.findUnique({ where: { userId } });
  if (!operator) {
    throw new ApiError(404, 'Operator not found');
  }
  const result = await OperatorWalletService.getByOperatorId(operator.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OperatorWalletService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OperatorWallet deleted successfully',
    data: result,
  });
});

export const OperatorWalletController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  getByOperatorId
};
