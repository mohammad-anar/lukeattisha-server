import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import handleZodError from "../../errors/handleZodError.js";
import handlePrismaError from "../../errors/handlePrismaError.js";
import handleValidationError from "../../errors/handleValidationError.js";
import { config } from "../../config/index.js";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode =
    err.statusCode || (httpStatus.INTERNAL_SERVER_ERROR as number);
  let success = false;
  let message = err.message || "Something went wrong!";
  let errorDetails = err;

  // Check if the error is a Zod validation error
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.errorMessages[0]?.message || simplifiedError.message;
    errorDetails = simplifiedError.errorMessages;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.errorMessages[0]?.message || simplifiedError.message;
    errorDetails = simplifiedError.errorMessages;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.errorMessages[0]?.message || simplifiedError.message;
    errorDetails = simplifiedError.errorMessages;
  } else if (err?.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token has expired";
    errorDetails = [{ path: "", message }];
  } else if (err?.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token";
    errorDetails = [{ path: "", message }];
  }

  res.status(statusCode).json({
    success,
    message,
    error: config.node_env === "development" ? errorDetails : undefined,
  });
};

export default globalErrorHandler;
