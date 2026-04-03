import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { CartItemService } from './cartItem.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CartItemService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'CartItem created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CartItemService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'CartItem fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await CartItemService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'CartItem fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await CartItemService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'CartItem updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await CartItemService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'CartItem deleted successfully',
    data: result,
  });
});

export const CartItemController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
