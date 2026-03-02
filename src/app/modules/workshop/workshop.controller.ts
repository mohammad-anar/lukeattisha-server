import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { getSingleFilePath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import { WorkshopService } from "./workshop.services.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { Prisma } from "@prisma/client";
import pick from "src/helpers.ts/pick.js";

const createWorkshop = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  const url = `http://${config.ip_address}:${config.port}`.concat(image);

  if (image) {
    payload.avatar = url;
  }

  // service will handle hashing of the plain password
  const result = await WorkshopService.createWorkshop(payload);

  sendResponse(res, {
    success: true,
    message: "Workshop created",
    statusCode: 201,
    data: result,
  });
});

const getAllWorkshops = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await WorkshopService.getAllWorkshops(filters, options);

  sendResponse(res, {
    success: true,
    message: "Workshops retrieve successfully",
    statusCode: 200,
    data: result,
  });
});

export const WorkshopController = {
  createWorkshop,
  getAllWorkshops,
};
