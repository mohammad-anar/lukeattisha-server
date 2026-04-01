import { z } from "zod";

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

export const AddonValidation = {
  createAddonZodSchema,
  updateAddonZodSchema,
};
