import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import handleZodError from "src/errors/handleZodError.js";
import { ZodError } from "zod";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR as number;
  let success = false;
  let message = err.message || "Something went wrong!";
  let errorDetails = err;

  // Check if the error is a Zod validation error
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorDetails = simplifiedError.errorMessages;
  }

  res.status(statusCode).json({
    success,
    message,
    error: errorDetails,
  });
};

export default globalErrorHandler;
