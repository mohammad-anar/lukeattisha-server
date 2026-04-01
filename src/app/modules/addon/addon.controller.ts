import { Request, Response } from "express";
import { AddonModule } from "./addon.service.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import pick from "../../../helpers.ts/pick.js";


const createAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await AddonModule.createAddon(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Addon created successfully",
    data: result,
  });
});


const getMyAddons = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const filters = pick(req.query, ["searchTerm", "minPrice", "maxPrice"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AddonModule.getMyAddons(userId, filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addons retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


const getAddonById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await AddonModule.getAddonById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addon details retrieved successfully",
    data: result,
  });
});

const updateAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await AddonModule.updateAddon(userId, id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addon updated successfully",
    data: result,
  });
});

const deleteAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await AddonModule.deleteAddon(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addon deleted successfully",
    data: result,
  });
});

export const AddonController = {
  createAddon,
  getMyAddons,
  getAddonById,
  updateAddon,
  deleteAddon,
};
