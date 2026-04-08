import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { CartService } from './cart.service.js';

const addItem = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.addItem(user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Item added to cart successfully',
    data: result,
  });
});

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.updateQuantity(user.id, req.params.cartItemId as string, req.body.quantity);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Item quantity updated successfully',
    data: result,
  });
});

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.getMyCart(user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Cart fetched successfully',
    data: result,
  });
});

const removeItem = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.removeItem(user.id, req.params.cartItemId as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Item removed from cart successfully',
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.clearCart(user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Cart cleared successfully',
    data: result,
  });
});

export const CartController = {
  addItem,
  getMyCart,
  removeItem,
  clearCart,
  updateQuantity,
};
