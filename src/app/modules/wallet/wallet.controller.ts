import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { WalletService } from "./wallet.services.js";

/* ================= GET WALLET ================= */
const getWallet = catchAsync(async (req: Request, res: Response) => {
  const wallet = await WalletService.getWalletByUser(
    req.params.userId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Wallet retrieved",
    data: wallet,
  });
});

/* ================= ADD FUNDS ================= */
const addFunds = catchAsync(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const wallet = await WalletService.addFunds(
    req.params.userId as string,
    Number(amount),
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Funds added successfully",
    data: wallet,
  });
});

/* ================= DEDUCT FUNDS ================= */
const deductFunds = catchAsync(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const wallet = await WalletService.deductFunds(
    req.params.userId as string,
    Number(amount),
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Funds deducted successfully",
    data: wallet,
  });
});

export const WalletController = { getWallet, addFunds, deductFunds };
