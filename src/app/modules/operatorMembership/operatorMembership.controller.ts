import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { OperatorMembershipService } from './operatorMembership.service.js';

const resolveOperatorId = async (req: Request): Promise<string> => {
  const userId = (req.user as any).id as string;
  const operator = await prisma.operator.findUnique({ where: { userId } });
  if (!operator) throw new ApiError(404, 'Operator profile not found');
  return operator.id;
};

function parseDateRange(req: Request): { startDate?: Date; endDate?: Date } {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  return {
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
}

const getMembershipStats = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const { startDate, endDate } = parseDateRange(req);
  const result = await OperatorMembershipService.getMembershipStats(operatorId, startDate, endDate);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Membership stats fetched successfully',
    data: result,
  });
});

const getOrderDistribution = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const { startDate, endDate } = parseDateRange(req);
  const result = await OperatorMembershipService.getOrderDistribution(operatorId, startDate, endDate);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order distribution fetched successfully',
    data: result,
  });
});

const getOrdersOverTime = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const months = req.query.months ? parseInt(req.query.months as string) : 6;
  const result = await OperatorMembershipService.getOrdersOverTime(operatorId, months);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Orders over time fetched successfully',
    data: result,
  });
});

const getOrderSummary = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const { startDate, endDate } = parseDateRange(req);
  const result = await OperatorMembershipService.getOrderSummary(operatorId, startDate, endDate);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Order summary fetched successfully',
    data: result,
  });
});

export const OperatorMembershipController = {
  getMembershipStats,
  getOrderDistribution,
  getOrdersOverTime,
  getOrderSummary,
};
