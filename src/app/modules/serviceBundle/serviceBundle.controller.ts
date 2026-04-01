import { Request, Response } from "express";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";
import httpStatus from "http-status";
import { ServiceBundleModule } from "./serviceBundle.service.js";
import pick from "helpers.ts/pick.js";
import { getSingleFilePath } from "app/shared/getFilePath.js";
import { config } from "config/index.js";


const createServiceBundle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;
  const payload = req.body;
  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.image = `http://${config.ip_address}:${config.port}${image}`;

  const result = await ServiceBundleModule.createServiceBundle(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service bundle created successfully",
    data: result,
  });
});

const getAllServiceBundles = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "operatorId"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ServiceBundleModule.getAllServiceBundles(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service bundles retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getServiceBundleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ServiceBundleModule.getServiceBundleById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service bundle details retrieved successfully",
    data: result,
  });
});

const updateServiceBundle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;
  const { id } = req.params as { id: string };
  const payload = req.body;

  const image = getSingleFilePath(req.files as any, "image") as string;
  if (image) payload.image = `http://${config.ip_address}:${config.port}${image}`;

  const result = await ServiceBundleModule.updateServiceBundle(userId, id, payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service bundle updated successfully",
    data: result,
  });
});

const deleteServiceBundle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await ServiceBundleModule.deleteServiceBundle(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service bundle deleted successfully",
    data: result,
  });
});

export const ServiceBundleController = {
  createServiceBundle,
  getAllServiceBundles,
  getServiceBundleById,
  updateServiceBundle,
  deleteServiceBundle,
}
