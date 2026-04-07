import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { OrderService } from './order.service.js';
import pick from '../../../helpers.ts/pick.js';

const checkout = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.checkout(user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Checkout initiated successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); 
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await OrderService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Orders fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order deleted successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = pick(req.query, ['searchTerm', 'status', 'paymentStatus']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  
  const result = await OrderService.getMyOrders(user, filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'My orders fetched successfully',
    meta: (result as any).meta,
    data: (result as any).data,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(req.params.id as string, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  checkout,
  getAll,
  getMyOrders,
  getById,
  update,
  updateOrderStatus,
  deleteById,
};
