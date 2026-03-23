import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Database Error";
  let errorMessages: any[] = [];

  if (err.code === "P1001") {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = "Database connection timed out or is unavailable";
  } else if (err.code === "P2002") {
    statusCode = StatusCodes.CONFLICT;
    const target = (err.meta?.target as string[]) || [];
    message = `Duplicate field value: ${target.join(", ")}`;
    errorMessages = [
      {
        path: target.join(", "),
        message,
      },
    ];
  } else if (err.code === "P2003") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Foreign key constraint failed";
  } else if (err.code === "P2011") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Null constraint violation";
  } else if (err.code === "P2012") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Missing required value";
  } else if (err.code === "P2014") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "The change you are trying to make would violate the required relation";
  } else if (err.code === "P2025") {
    statusCode = StatusCodes.NOT_FOUND;
    message = (err.meta?.cause as string) || "Record not found";
    errorMessages = [
      {
        path: "",
        message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handlePrismaError;
