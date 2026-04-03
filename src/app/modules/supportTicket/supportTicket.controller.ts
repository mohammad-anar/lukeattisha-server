import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { SupportTicketService } from './supportTicket.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'SupportTicket created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.getAll(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'SupportTicket fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'SupportTicket fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.update(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'SupportTicket updated successfully',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportTicketService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'SupportTicket deleted successfully',
    data: result,
  });
});

export const SupportTicketController = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
