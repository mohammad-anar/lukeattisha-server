import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OrderItemService } from './orderItem.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderItemService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'OrderItem created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderItemService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OrderItem fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderItemService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OrderItem fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderItemService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OrderItem updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderItemService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OrderItem deleted successfully',
    data: result,
  });
});

export const OrderItemController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
