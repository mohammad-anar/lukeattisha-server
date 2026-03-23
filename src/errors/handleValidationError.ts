import { StatusCodes } from "http-status-codes";

const handleValidationError = (err: any) => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = "Validation Error";
  const errorMessages = [
    {
      path: "",
      message: err.message,
    },
  ];

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleValidationError;
