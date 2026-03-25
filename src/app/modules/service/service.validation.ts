import { z } from "zod";

const createServiceZodSchema = z.object({
 
    categoryId: z.string({
      message: "Category ID is required",
    }),
    name: z.string({
      message: "Service name is required",
    }),
    basePrice: z.number({
      message: "Base price is required",
    }).min(0),
  
});

const updateServiceZodSchema = z.object({  
    categoryId: z.string().optional(),
    name: z.string().optional(),
    basePrice: z.number().min(0).optional(),
});

const createAddonZodSchema = z.object({
    name: z.string({
      message: "Addon name is required",
    }),
    price: z.number({
      message: "Addon price is required",
    }).min(0),
});

const updateAddonZodSchema = z.object({
 
    name: z.string().optional(),
    price: z.number().min(0).optional(),

});

export const ServiceValidation = {
  createServiceZodSchema,
  updateServiceZodSchema,
  createAddonZodSchema,
  updateAddonZodSchema,
};
