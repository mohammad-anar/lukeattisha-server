import { z } from "zod";

const addToCartZodSchema = z.object({
  serviceId: z.string().uuid("Invalid Service ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  addons: z.array(z.string().uuid("Invalid Addon ID")).optional(),
});

const updateCartItemZodSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  addons: z.array(z.string().uuid("Invalid Addon ID")).optional(),
}).refine(data => data.quantity !== undefined || data.addons !== undefined, {
  message: "At least one field (quantity or addons) must be provided for update",
});

export const CartValidation = {
  addToCartZodSchema,
  updateCartItemZodSchema,
};
