import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AddressService } from './address.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const payload = { ...req.body, userId: user.id };
  const result = await AddressService.create(user.id, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Address created successfully',
    data: result,
  });
});

// const getAll = catchAsync(async (req: Request, res: Response) => {
//   const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed
//   const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//   const result = await AddressService.getAll(filters, options);
//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Address fetched successfully',
//     meta: result.meta,
//     data: result.data,
//   });
// });

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AddressService.update(user.id,req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address updated successfully',
    data: result,
  });
});

const setDefault = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AddressService.setDefault(user.id, req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address set as default successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AddressService.deleteById(user.id,req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address deleted successfully',
    data: result,
  });
});

const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AddressService.getMyAddresses(user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Addresses fetched successfully',
    data: result,
  });
});

export const AddressController = {
  create,
  getById,
  update,
  setDefault,
  deleteById,
  getMyAddresses,
};
