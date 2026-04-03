import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { UserPaymentCardService } from './userPaymentCard.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await UserPaymentCardService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'UserPaymentCard created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserPaymentCardService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserPaymentCard fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserPaymentCardService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserPaymentCard fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await UserPaymentCardService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserPaymentCard updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserPaymentCardService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'UserPaymentCard deleted successfully',
    data: result,
  });
});

export const UserPaymentCardController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
