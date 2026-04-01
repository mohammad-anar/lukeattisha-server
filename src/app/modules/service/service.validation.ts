import { z } from "zod";

const createServiceSchema = z.object({
  operatorId: z.string().uuid(),

  categoryId: z.string().uuid(),

  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name too long"),

  basePrice: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)), {
      message: "basePrice must be a valid number",
    })
    .transform((val) => Number(val).toFixed(2)),

  isActive: z.boolean().optional().default(true),
});

const updateServiceSchema = z.object({
  operatorId: z.string().uuid().optional(),

  categoryId: z.string().uuid().optional(),

  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100)
    .optional(),

  basePrice: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)), {
      message: "basePrice must be a valid number",
    })
    .transform((val) => Number(val).toFixed(2))
    .optional(),

  isActive: z.boolean().optional(),
});

const assignAddonZodSchema = z.object({
  addonId: z.string().uuid("Invalid addonId"),
});

const updateAddonServiceSchema = z.object({
  serviceId: z.string().uuid().optional(),

  addonId: z.string().uuid().optional(),
});

export const ServiceValidation = {
  createServiceSchema,
  updateServiceSchema,
  assignAddonZodSchema,
  updateAddonServiceSchema
};
