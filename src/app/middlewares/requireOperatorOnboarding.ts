import { Request, Response, NextFunction } from "express";
import { prisma } from "../../helpers.ts/prisma.js";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to ensure that an Operator has completed their Stripe onboarding
 * and has a connected account ID before being allowed to perform certain actions (like creating services).
 */
export const requireOperatorOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user || user.role !== "OPERATOR") {
      return next(new ApiError(StatusCodes.FORBIDDEN, "Only operators can perform this action."));
    }

    const operator = await prisma.operator.findUnique({
      where: { userId: user.id },
    });

    if (!operator || !operator.stripeConnectedAccountId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You must connect your Stripe account before managing services or bundles."
      );
    }

    if (operator.approvalStatus !== "APPROVED") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Your operator account is still pending approval by the admin."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
