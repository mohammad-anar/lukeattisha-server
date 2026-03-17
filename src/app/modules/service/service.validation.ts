import { z } from "zod";

const createServiceZodSchema = z.object({
  body: z.object({
    categoryId: z.string({
      message: "Category ID is required",
    }),
    name: z.string({
      message: "Service name is required",
    }),
    basePrice: z.number({
      message: "Base price is required",
    }).min(0),
    isActive: z.boolean().optional(),
  }),
});

const updateServiceZodSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

const createAddonZodSchema = z.object({
  body: z.object({
    name: z.string({
      message: "Addon name is required",
    }),
    price: z.number({
      message: "Addon price is required",
    }).min(0),
  }),
});

const updateAddonZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().min(0).optional(),
  }),
});

export const ServiceValidation = {
  createServiceZodSchema,
  updateServiceZodSchema,
  createAddonZodSchema,
  updateAddonZodSchema,
};
