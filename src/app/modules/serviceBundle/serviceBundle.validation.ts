import { z } from "zod";

const createServiceBundleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long"),

  description: z.string().optional(),

  image: z
    .string()
    .url("Image must be a valid URL")
    .optional(),

  // ✅ FIX: Decimal safe handling
  bundlePrice: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)), {
      message: "Bundle price must be a valid number",
    })
    .transform((val) => Number(val).toFixed(2)),

  // ✅ FIX: prevent duplicate services
  serviceIds: z
    .array(z.string().uuid("Invalid serviceId"))
    .min(1, "At least one service is required")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate serviceIds are not allowed",
    }),
});

const updateServiceBundleSchema = z.object({
  name: z.string().min(1).max(100).optional(),

  description: z.string().optional(),

  image: z.string().url().optional(),

  bundlePrice: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)))
    .transform((val) => Number(val).toFixed(2))
    .optional(),

  serviceIds: z
    .array(z.string().uuid())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate serviceIds are not allowed",
    })
    .optional(),
});
export const ServiceBundleValidation = {
  createServiceBundleSchema,
  updateServiceBundleSchema,
};
