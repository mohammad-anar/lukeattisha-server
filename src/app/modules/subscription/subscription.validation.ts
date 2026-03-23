import { z } from "zod";

const createPackageSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    durationDays: z.number().int().positive(),
    freeDelivery: z.boolean().optional(),
  }),
});

const updatePackageSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    durationDays: z.number().int().positive().optional(),
    freeDelivery: z.boolean().optional(),
  }),
});

const subscribeSchema = z.object({
  body: z.object({
    packageId: z.string().uuid(),
  }),
});

export const SubscriptionValidation = { createPackageSchema, updatePackageSchema, subscribeSchema };
