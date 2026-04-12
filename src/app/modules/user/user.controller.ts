import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { UserService } from './user.service.js';
import pick from '../../../helpers.ts/pick.js';
import { getSingleFilePath } from '../../shared/getFilePath.js';
import { config } from 'config/index.js';
const create = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await UserService.create(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await UserService.createAdmin(payload, creatorId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Admin account created successfully',
    data: result,
  });
});

const createOperator = catchAsync(async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await UserService.createOperator(payload, creatorId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Operator account created successfully',
    data: result,
  });
});

const approveOperator = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.approveOperator(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator approved successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'role', 'isVerified', 'isDeleted', "status", "minspent", "maxspent", "minRating", "maxRating"]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAllUsers(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isVerified', 'isDeleted']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAllAdmins({ ...filters, role: 'ADMIN' }, options);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admins fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllOperators = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isVerified', "status", 'isDeleted']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await UserService.getAllOperators({ ...filters, role: 'OPERATOR' }, options);
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
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.avatar = `http://${config.ip_address}:${config.port}${image}`;

  const result = await UserService.update(req.params.id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated successfully',
    data: result,
  });
});

const banUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.banUser(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User banned successfully',
    data: result,
  });
});

const unbanUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.unbanUser(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User unbanned successfully',
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

const revertDelete = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.revertDelete(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User reverted successfully',
    data: result,
  });
});

const updateNotificationPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await UserService.updateNotificationPreferences(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification preferences updated successfully',
    data: result,
  });
});

const getNotificationPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await UserService.getNotificationPreferences(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification preferences fetched successfully',
    data: result,
  });
});

export const UserController = {
  create,
  createAdmin,
  createOperator,
  approveOperator,
  getAll,
  getAllAdmins,
  getAllOperators,
  getById,
  getMe,
  update,
  deleteById,
  banUser,
  unbanUser,
  revertDelete,
  updateNotificationPreferences,
  getNotificationPreferences,
};
