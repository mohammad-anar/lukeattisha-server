import { Request, Response } from "express";
import { FavoriteService } from "./favorite.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await FavoriteService.addFavorite(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service favorited successfully",
    data: result,
  });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { serviceId } = req.params as { serviceId: string };
  const result = await FavoriteService.removeFavorite(userId, serviceId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Favorite removed successfully",
    data: result,
  });
});

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await FavoriteService.getMyFavorites(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Favorites retrieved successfully",
    data: result,
  });
});

export const FavoriteController = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
};
