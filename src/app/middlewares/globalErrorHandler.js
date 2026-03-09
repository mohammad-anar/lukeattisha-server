import httpStatus from "http-status";
import handleZodError from "src/errors/handleZodError.js";
import { ZodError } from "zod";
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
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
