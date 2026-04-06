import { z } from "zod";

const selectedAddonSchema = z.object({
  addonId: z.string().min(1, "Addon ID is required"),
});

const cartItemSchema = z.object({
  serviceId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive").optional(),
  selectedAddons: z.array(selectedAddonSchema).optional(),
}).refine(
  (data) => data.serviceId || data.bundleId,
  {
    message: "Either serviceId or bundleId is required",
    path: ["serviceId"],
  }
).refine(
  (data) => !(data.serviceId && data.bundleId),
  {
    message: "Provide only one of serviceId or bundleId",
    path: ["serviceId"],
  }
);


export const createCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  items: z.array(cartItemSchema).min(1, "At least one item is required"),
});


export const updateCartSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(), // for existing item
      serviceId: z.string().optional(),
      bundleId: z.string().optional(),
      quantity: z.number().int().min(1).optional(),
      price: z.number().min(0).optional(),
      selectedAddons: z.array(
        z.object({
          addonId: z.string()
        })
      ).optional()
    }).refine(
      (data) => data.serviceId || data.bundleId || data.id,
      {
        message: "Item must have id or serviceId or bundleId",
      }
    )
  ).optional(),
});