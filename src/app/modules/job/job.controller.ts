import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { JobService } from "./job.services.js";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await JobService.createJob(payload);

  sendResponse(res, {
    success: true,
    message: "Job created successfully",
    statusCode: 201,
    data: result,
  });
});

export const JobController = {
  createJob,
};
