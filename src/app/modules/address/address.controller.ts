import { Request, Response } from "express";
import { UserAddressService } from "./address.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

/* ================= CREATE ADDRESS ================= */
const createAddress = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;

  const result = await UserAddressService.createAddress(userId, req.body);

  sendResponse(res, {
    success: true,
    message: "Address created successfully",
    statusCode: 201,
    data: result,
  });
});

/* ================= GET MY ADDRESSES ================= */
const getMyAddresses = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;

  const result = await UserAddressService.getMyAddresses(userId);

  sendResponse(res, {
    success: true,
    message: "Addresses retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= GET SINGLE ADDRESS ================= */
const getSingleAddress = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;

  const result = await UserAddressService.getSingleAddress(id);

  sendResponse(res, {
    success: true,
    message: "Address retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= UPDATE ADDRESS ================= */
const updateAddress = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;

  const result = await UserAddressService.updateAddress(id, req.body);

  sendResponse(res, {
    success: true,
    message: "Address updated successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= DELETE ADDRESS ================= */
const deleteAddress = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;

  const result = await UserAddressService.deleteAddress(id);

  sendResponse(res, {
    success: true,
    message: "Address deleted successfully",
    statusCode: 200,
    data: result,
  });
});

/* ================= SET DEFAULT ADDRESS ================= */
const setDefaultAddress = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await UserAddressService.setDefaultAddress(userId, id);

  sendResponse(res, {
    success: true,
    message: "Default address updated successfully",
    statusCode: 200,
    data: result,
  });
});

export const UserAddressController = {
  createAddress,
  getMyAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
