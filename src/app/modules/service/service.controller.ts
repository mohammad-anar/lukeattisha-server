import { Request, Response } from "express";
import { ServiceModule } from "./service.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";
import { getSingleFilePath } from "app/shared/getFilePath.js";
import { config } from "config/index.js";
import pick from "helpers.ts/pick.js";


const createService = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const payload = req.body;

  const image = getSingleFilePath(req.files, "image") as string;
  if (image)
    payload.image = `http://${config.ip_address}:${config.port}${image}`;

  const result = await ServiceModule.createService(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service created successfully",
    data: result,
  });
});
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "operatorId", "categoryId", "isActive", "minPrice", "maxPrice"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ServiceModule.getAllServices(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


const getServicesByOperator = catchAsync(async (req: Request, res: Response) => {
  const { operatorId } = req.params as { operatorId: string };
  const result = await ServiceModule.getServicesByOperator(operatorId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services retrieved successfully",
    data: result,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ServiceModule.getServiceById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service details retrieved successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };

  const payload = req.body;

  const image = getSingleFilePath(req.files, "image") as string;
  if (image)
    payload.image = `http://${config.ip_address}:${config.port}${image}`;

  const result = await ServiceModule.updateService(userId, id, payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await ServiceModule.deleteService(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service deleted successfully",
    data: result,
  });
});

const createAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { serviceId } = req.params as { serviceId: string };
  const result = await ServiceModule.createAddon(userId, serviceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Addon assigned successfully",
    data: result,
  });
});

const getAddonById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ServiceModule.getAddonById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addon details retrieved successfully",
    data: result,
  });
});

const getAddonsByServiceId = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params as { serviceId: string };
  const result = await ServiceModule.getAddonsByServiceId(serviceId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addons retrieved successfully",
    data: result,
  });
});


const deleteAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await ServiceModule.deleteAddon(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Addon deleted successfully",
    data: result,
  });
});

export const ServiceController = {
  createService,
  getServicesByOperator,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  createAddon,
  getAddonById,
  getAddonsByServiceId,
  deleteAddon,
};
