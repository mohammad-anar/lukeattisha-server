import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { OperatorService } from "./operator.service.js";
const createProfile = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const result = await OperatorService.createOperatorProfile(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Operator profile created successfully",
        data: result,
    });
});
const getMyProfile = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const result = await OperatorService.getOperatorProfile(userId);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Operator profile retrieved successfully",
        data: result,
    });
});
const getAllOperators = catchAsync(async (req, res) => {
    const result = await OperatorService.getAllOperators();
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Operators retrieved successfully",
        data: result,
    });
});
const getOperatorById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OperatorService.getOperatorById(id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Operator details retrieved successfully",
        data: result,
    });
});
const updateProfile = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const result = await OperatorService.updateOperatorProfile(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Operator profile updated successfully",
        data: result,
    });
});
const assignCategories = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    const result = await OperatorService.assignCategories(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Categories assigned successfully",
        data: result,
    });
});
export const OperatorController = {
    createProfile,
    getMyProfile,
    getAllOperators,
    getOperatorById,
    updateProfile,
    assignCategories,
};
