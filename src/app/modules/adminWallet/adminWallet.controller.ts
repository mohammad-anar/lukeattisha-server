import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AdminWalletService } from './adminWallet.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'AdminWallet created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AdminWalletService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByAdminId = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const result = await AdminWalletService.getByAdminId(adminId as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminWalletService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'AdminWallet deleted successfully',
    data: result,
  });
});

export const AdminWalletController = {
  create,
  getAll,
  getById,
  getByAdminId,
  update,
  deleteById,
};
