import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { AddressService } from './address.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Address created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address deleted successfully',
    data: result,
  });
});

export const AddressController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
