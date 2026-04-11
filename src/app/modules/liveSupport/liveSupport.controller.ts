import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { LiveSupportService } from './liveSupport.service.js';
import pick from '../../../helpers.ts/pick.js';

const startChat = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await LiveSupportService.getOrCreateRoom(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Live support room retrieved successfully',
    data: result,
  });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req as any).user.id;
  const payload = req.body;
  
  // Handle images if uploaded via fileUploadHandler
  let images = [];
  if (req.files && (req.files as any).image) {
    images = (req.files as any).image.map((file: any) => file.path);
  }

  const result = await LiveSupportService.sendMessage({
    ...payload,
    senderId,
    images: images.length > 0 ? images : payload.images
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Message sent successfully',
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await LiveSupportService.getMessages(req.params.roomId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Messages fetched successfully',
    data: result,
  });
});

const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await LiveSupportService.getAllRooms(filters, options);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support rooms fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const LiveSupportController = {
  startChat,
  sendMessage,
  getMessages,
  getAllRooms,
};
