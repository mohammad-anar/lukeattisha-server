import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { BikeService } from "./bike.services.js";

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

const getBikeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BikeService.getBikeById(id);

  sendResponse(res, {
    success: true,
    message: "Bike retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const updateBike = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { id } = req.params;
  const result = await BikeService.updateBike(id, payload);

  sendResponse(res, {
    success: true,
    message: "Bike updated successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteBike = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BikeService.deleteBike(id);

  sendResponse(res, {
    success: true,
    message: "Bike deleted successfully",
    statusCode: 200,
    data: result,
  });
});

export const BikeController = {
  createBike,
  getBikeById,
  updateBike,
  deleteBike,
};
