import { StatusCodes } from "http-status-codes";

const handleValidationError = (err: any) => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = "Validation Error";

  // Parse the Prisma validation error message to make it user-readable
  console.log(`[PRISMA VALIDATION ERROR RAW]:`, err.message);
  const parsedMessage = parsePrismaValidationError(err.message);

  const errorMessages = [
    {
      path: "",
      message: parsedMessage,
    },
  ];

  return {
    statusCode,
    message,
    errorMessages,
  };
};

const parsePrismaValidationError = (errorMessage: string): string => {
  // Extract the field/argument name
  const fieldMatch = errorMessage.match(/Invalid value for (?:argument|field) [`"]?([^`"]+)[`"]?/) || 
                     errorMessage.match(/at\s+[`"]?([^`"]+)[`"]?/);
  const field = fieldMatch ? fieldMatch[1] : "field";

  // Extract the provided invalid value
  const valueMatch = errorMessage.match(/got\s+[`"]?([^`"]+)[`"]?/) || 
                     errorMessage.match(/:\s+[`"]?([^`"]+)[`"]?\./) ||
                     errorMessage.match(/value:\s+[`"]?([^`"]+)[`"]?/);
  const invalidValue = valueMatch ? valueMatch[1] : null;

  // Extract the expected type/logic
  const typeMatch = errorMessage.match(/Expected\s+([^\.]+)\./);
  const expected = typeMatch ? typeMatch[1] : "valid value";

  if (invalidValue) {
    return `Invalid value for ${field}: "${invalidValue}". Expected ${expected}.`;
  }
  
  // If parsing fails but the message is already somewhat clear
  if (errorMessage.includes("Invalid value")) {
    return errorMessage.split("\n")[0].replace(/  +/g, ' ').trim();
  }

  return "Validation failed. Please check your data.";
};

export default handleValidationError;
