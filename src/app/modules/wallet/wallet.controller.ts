import { Request, Response } from "express";
import { WalletService } from "./wallet.services.js";
import { Role } from "@prisma/client";
import ApiError from "../../../errors/ApiError.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";

/* ================= GET WALLET ================= */
const getWallet = catchAsync(async (req: any, res: Response) => {
  if (req.user?.role === Role.USER && req.user?.id !== req.params.userId) {
    throw new ApiError(403, "You are not authorized to view this wallet.");
  }
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
const addFunds = catchAsync(async (req: any, res: Response) => {
  if (req.user?.role === Role.USER && req.user?.id !== req.params.userId) {
    throw new ApiError(403, "You are not authorized to add funds to this wallet.");
  }
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
const deductFunds = catchAsync(async (req: any, res: Response) => {
  if (req.user?.role === Role.USER && req.user?.id !== req.params.userId) {
    throw new ApiError(403, "You are not authorized to deduct funds from this wallet.");
  }
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
