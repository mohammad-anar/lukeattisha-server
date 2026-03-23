import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { ReviewService } from "./review.service.js";

const createReview = catchAsync(async (req: any, res: Response) => {
  const result = await ReviewService.createReview(req.user.id, req.body);
  sendResponse(res, { success: true, statusCode: 201, message: "Review submitted successfully", data: result });
});

const getReviewsByService = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsByService(req.params.serviceId as string);
  sendResponse(res, { success: true, statusCode: 200, message: "Reviews retrieved successfully", data: result });
});

const getMyReviews = catchAsync(async (req: any, res: Response) => {
  const result = await ReviewService.getMyReviews(req.user.id);
  sendResponse(res, { success: true, statusCode: 200, message: "My reviews retrieved", data: result });
});

const replyToReview = catchAsync(async (req: any, res: Response) => {
  const result = await ReviewService.replyToReview(req.user.id, req.params.id, req.body);
  sendResponse(res, { success: true, statusCode: 200, message: "Reply added successfully", data: result });
});

const deleteReview = catchAsync(async (req: any, res: Response) => {
  const result = await ReviewService.deleteReview(req.user.id, req.params.id);
  sendResponse(res, { success: true, statusCode: 200, message: "Review deleted", data: result });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();
  sendResponse(res, { success: true, statusCode: 200, message: "All reviews retrieved", data: result });
});

export const ReviewController = {
  createReview,
  getReviewsByService,
  getMyReviews,
  replyToReview,
  deleteReview,
  getAllReviews,
};
