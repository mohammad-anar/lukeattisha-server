import { StatusCodes } from "http-status-codes";

const handleValidationError = (err: any) => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = "Validation Error";

  // Parse the Prisma validation error message to make it user-readable
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
  // Extract the argument name, e.g., "status"
  const argMatch = errorMessage.match(/Invalid value for argument `([^`]+)`/);
  const argument = argMatch ? argMatch[1] : "field";

  // Extract the expected type, e.g., "UserStatus"
  const typeMatch = errorMessage.match(/Expected ([^\.]+)\./);
  const expectedType = typeMatch ? typeMatch[1] : "valid value";

  // Extract the invalid value, e.g., "BANNEDd"
  const valueMatch = errorMessage.match(/data:\s*{\s*[^}]*:\s*"([^"]+)"/);
  const invalidValue = valueMatch ? valueMatch[1] : "provided value";

  // Map common types to their possible values
  const typeValues: Record<string, string[]> = {
    UserStatus: ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"],
    Role: ["USER", "OPERATOR", "ADMIN"],
    OrderStatus: [
      "PENDING",
      "ACCEPTED",
      "PROCESSING",
      "READY_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "DISPUTED",
      "REFUNDED",
    ],
    PaymentStatus: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIAL"],
    PaymentMethodType: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
    TicketStatus: ["OPEN", "IN_PROGRESS", "RESOLVED"],
  };

  const possibleValues = typeValues[expectedType] || [];

  if (possibleValues.length > 0) {
    return `Invalid ${argument} value: "${invalidValue}". Expected one of: ${possibleValues.join(", ")}.`;
  } else {
    return `Invalid value for ${argument}: "${invalidValue}". Expected ${expectedType}.`;
  }
};

export default handleValidationError;
