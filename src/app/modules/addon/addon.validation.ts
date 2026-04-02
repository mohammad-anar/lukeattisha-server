import { z } from "zod";

const createAddonZodSchema = z.object({
  name: z.string({
    message: "Addon name is required",
  }),
  price: z.number({
    message: "Addon price is required",
  }).min(0),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateAddonZodSchema = z.object({
  name: z.string().optional(),
  price: z.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const AddonValidation = {
  createAddonZodSchema,
  updateAddonZodSchema,
};
