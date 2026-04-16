import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync.js';
import sendResponse from '../../shared/sendResponse.js';
import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';
import { OperatorOrdersService } from './operatorOrders.service.js';

/**
 * Resolves the Operator.id from the authenticated user's JWT.
 */
async function resolveOperatorId(req: Request): Promise<string> {
  const userId = (req.user as any).id as string;
  const operator = await prisma.operator.findUnique({ where: { userId } });
  if (!operator) {
    throw new ApiError(404, 'Operator profile not found for this user');
  }
  return operator.id;
}

const getStats = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const storeId = req.query.storeId as string | undefined;

  const result = await OperatorOrdersService.getStats(operatorId, storeId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Operator order stats fetched successfully',
    data: result,
  });
});

const getNewlyPlacedOrders = catchAsync(async (req: Request, res: Response) => {
  const operatorId = await resolveOperatorId(req);
  const storeId = req.query.storeId as string | undefined;

  const result = await OperatorOrdersService.getNewlyPlacedOrders(operatorId, storeId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Newly placed orders fetched successfully',
    data: result,
  });
});

export const OperatorOrdersController = {
  getStats,
  getNewlyPlacedOrders,
};
