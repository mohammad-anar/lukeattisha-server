import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { ServiceModule } from "./service.service.js";
const createService = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const result = await ServiceModule.createService(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Service created successfully",
        data: result,
    });
});
const getServicesByOperator = catchAsync(async (req, res) => {
    const { operatorId } = req.params;
    const result = await ServiceModule.getServicesByOperator(operatorId);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Services retrieved successfully",
        data: result,
    });
});
const getServiceById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ServiceModule.getServiceById(id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Service details retrieved successfully",
        data: result,
    });
});
const updateService = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const result = await ServiceModule.updateService(userId, id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Service updated successfully",
        data: result,
    });
});
const deleteService = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const result = await ServiceModule.deleteService(userId, id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Service deleted successfully",
        data: result,
    });
});
const createAddon = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const { serviceId } = req.params;
    const result = await ServiceModule.createAddon(userId, serviceId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Addon created successfully",
        data: result,
    });
});
const updateAddon = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const result = await ServiceModule.updateAddon(userId, id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Addon updated successfully",
        data: result,
    });
});
const deleteAddon = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
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
    getServiceById,
    updateService,
    deleteService,
    createAddon,
    updateAddon,
    deleteAddon,
};
