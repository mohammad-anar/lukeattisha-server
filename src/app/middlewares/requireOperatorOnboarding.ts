import { Request, Response, NextFunction } from "express";
import { prisma } from "../../helpers.ts/prisma.js";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { StripeHelpers } from "helpers.ts/stripeHelpers.js";

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
    const user = req.user as any;
    if (!user || user.role !== "OPERATOR") {
      return next(new ApiError(StatusCodes.FORBIDDEN, "Only operators can perform this action."));
    }

    const operator = await prisma.operator.findUnique({
      where: { userId: user.id },
    });

    if (!operator || !operator.stripeAccountId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You must connect your Stripe account before managing services or bundles."
      );
    }

    // Allow operators to setup their services after Stripe connection
    // We defer the approval check to when their store is published or goes live.

    if (operator.approvalStatus !== "APPROVED") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Your account is not approved yet. Please contact the administrator for approval."
      );
    }

    if (operator.stripeAccountStatus !== "ACTIVE") {
      const onboardingLink = await StripeHelpers.generateAccountOnboardingLink(operator.stripeAccountId);
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        JSON.stringify({
           message: "You must fully onboard your Stripe connect account before managing services or bundles.",
           onboardingUrl: onboardingLink.url
        })
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
