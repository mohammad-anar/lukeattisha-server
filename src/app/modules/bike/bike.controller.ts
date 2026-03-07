import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { BikeService } from "./bike.services.js";
import sendResponse from "src/app/shared/sendResponse.js";

const createBike = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await BikeService.createBike(payload);

  sendResponse(res, {
    success: true,
    message: "Bike created successfully",
    statusCode: 201,
    data: result,
  });
});
