import { StatusCodes } from "http-status-codes";

const handleValidationError = (err: any) => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = "Validation Error";

  // Extract the first 3 meaningful lines of the error (where the actual mistake is described)
  const messageLines = err.message.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0 && !l.startsWith('In File:'));
  const cleanErrorMessage = messageLines.slice(0, 3).join(" ");
  
  console.log(`[PRISMA VALIDATION ERROR RAW]:`, err.message);
  const parsedMessage = parsePrismaValidationError(cleanErrorMessage);

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
  // Extract the actual error message
  if (!errorMessage) return "Validation failed.";

  // Regex patterns for various Prisma Validation Errors
  const patterns = [
    { regex: /Invalid value for argument `([^`]+)`. Expected ([^,]+), got ([^.]+)./, format: (m: any) => `Invalid value for "${m[1]}". Expected ${m[2]} but got ${m[3]}.` },
    { regex: /Invalid value for argument `([^`]+)`. Expected ([^.]+)./, format: (m: any) => `Invalid value for "${m[1]}". Expected ${m[2]}.` },
    { regex: /Invalid value for field: "([^"]+)". Expected ([^.]+)./, format: (m: any) => `Invalid value for field "${m[1]}". Expected ${m[2]}.` },
    { regex: /Expected ([^,]+), got ([^.]+)./, format: (m: any) => `Expected ${m[1]} but got ${m[2]}.` },
    { regex: /Argument `([^`]+)` is missing./, format: (m: any) => `The field "${m[1]}" is required.` },
    { regex: /Field `([^`]+)` is of an invalid type. Expected ([^,]+), got ([^.]+)./, format: (m: any) => `Field "${m[1]}" must be ${m[2]} (got ${m[3]}).` }
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern.regex);
    if (match) return pattern.format(match);
  }

  // Fallback: Show the first meaningful line of the error
  return errorMessage.split("\n")[0].replace(/  +/g, ' ').trim();
};

export default handleValidationError;
