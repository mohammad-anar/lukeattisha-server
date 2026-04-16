import { z } from "zod";

const decimalField = z.union([
  z.number(),
  z.string().regex(/^\d+(\.\d+)?$/, "Invalid decimal format")
]);

export const createServiceSchema = z.object({
  operatorId: z.string({
    message: "Operator ID is required",
  }),

  categoryId: z.string({
    message: "Category ID is required",
  }),

  name: z.string({
    message: "Service name is required",
  }).min(1),

  basePrice: decimalField,

  description: z.string().optional(),
  addonIds: z.array(z.string()).optional(),
});

export const updateServiceSchema = z.object({
  operatorId: z.string().optional(),
  categoryId: z.string().optional(),
  name: z.string().min(1).optional(),
  basePrice: decimalField.optional(),
  description: z.string().optional(),
  addonIds: z.array(z.string()).optional(),
  isActive: z.union([
    z.boolean(),
    z.string().transform((val) => val === 'true')
  ]).optional(),
}).partial();

export const assignAddonsSchema = z.object({
  serviceId: z.string({ message: 'Service ID is required' }),
  addonIds: z.array(z.string(), { message: 'Addon IDs are required' }),
});