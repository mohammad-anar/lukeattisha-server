import { Request, Response } from "express";
import { ServiceModule } from "./service.service.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";

const createService = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await ServiceModule.createService(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service created successfully",
    data: result,
  });
});
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceModule.getAllServices();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services retrieved successfully",
    data: result,
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
  const result = await ServiceModule.updateService(userId, id, req.body);

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
    message: "Addon created successfully",
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

const updateAddon = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { id } = req.params as { id: string };
  const result = await ServiceModule.updateAddon(userId, id, req.body);

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
  updateAddon,
  deleteAddon,
};
