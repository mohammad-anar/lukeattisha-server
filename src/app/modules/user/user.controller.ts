import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { UserService } from './user.service.js';
import pick from '../../../helpers.ts/pick.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const result = await UserService.createAdmin(req.body, creatorId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Admin account created successfully',
    data: result,
  });
});

const createOperator = catchAsync(async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const result = await UserService.createOperator(req.body, creatorId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Operator account created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAll(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAll({ ...filters, role: 'ADMIN' }, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admins fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllOperators = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'status']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAll({ ...filters, role: 'OPERATOR' }, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operators fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.update(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.getMe(user.id, user.role);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User profile fetched successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  create,
  createAdmin,
  createOperator,
  getAll,
  getAllAdmins,
  getAllOperators,
  getById,
  getMe,
  update,
  deleteById,
};
