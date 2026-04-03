import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { ChatParticipantService } from './chatParticipant.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatParticipantService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'ChatParticipant created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatParticipantService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatParticipant fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatParticipantService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatParticipant fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatParticipantService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatParticipant updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatParticipantService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'ChatParticipant deleted successfully',
    data: result,
  });
});

export const ChatParticipantController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
