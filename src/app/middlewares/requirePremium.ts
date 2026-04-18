import { Request, Response, NextFunction } from "express";
import { prisma } from "../../helpers.ts/prisma.js";

export const requirePremium = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.body.userId || req.query.userId;
  if (!userId) return res.status(401).json({ error: "User not found" });

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gte: new Date() },
    },
  });

  if (!subscription) return res.status(403).json({ error: "Premium required" });

  next();
};
