import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { JobOfferServices } from "./jobOffer.services.js";
import sendResponse from "src/app/shared/sendResponse.js";

const createJobOffer = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await JobOfferServices.createJobOffer(payload);

  sendResponse(res, {
    success: true,
    message: "Job offer created successfully",
    statusCode: 201,
    data: result,
  });
});

export const JobOfferController = { createJobOffer };
