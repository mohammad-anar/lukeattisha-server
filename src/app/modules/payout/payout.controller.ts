import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { PayoutService } from "./payout.services.js";

/* ================= CREATE PAYOUT ================= */
const createPayout = catchAsync(async (req: Request, res: Response) => {
  const { operatorId, walletId, amount } = req.body;
  const payout = await PayoutService.createPayout(
    operatorId,
    walletId,
    Number(amount),
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payout created",
    data: payout,
  });
});

/* ================= GET PAYOUTS BY OPERATOR ================= */
const getPayouts = catchAsync(async (req: Request, res: Response) => {
  const payouts = await PayoutService.getPayoutsByOperator(
    req.params.operatorId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payouts retrieved",
    data: payouts,
  });
});

/* ================= UPDATE PAYOUT STATUS ================= */
const updatePayoutStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const payout = await PayoutService.updatePayoutStatus(req.params.id as string, status);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payout status updated",
    data: payout,
  });
});

export const PayoutController = {
  createPayout,
  getPayouts,
  updatePayoutStatus,
};
