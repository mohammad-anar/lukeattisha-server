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
  const filters = pick(req.query, ['searchTerm', 'status', "paymentStatus", "operatorId", "fromDate", "toDate"]); 
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
  if (req.body.status === 'COMPLETED') req.body.status = 'DELIVERED';
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
  const filters = pick(req.query, ['searchTerm', 'status', 'paymentStatus', "pastOrders"]);
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

const getActiveOrders = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.getActiveOrders(user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Active orders fetched successfully',
    data: result,
  });
});

const repayOrder = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.repayOrder(user.id, req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'New payment URL generated successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  let status = req.body.status;
  if (status === 'COMPLETED') status = 'DELIVERED';
  const result = await OrderService.updateOrderStatus(req.params.id as string, status);
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
  getActiveOrders,
  repayOrder,
  getById,
  update,
  updateOrderStatus,
  deleteById,
};
