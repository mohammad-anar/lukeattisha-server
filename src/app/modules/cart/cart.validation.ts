import { z } from "zod";

const addItemSchema = z.object({
  storeServiceId: z.string().optional(),
  storeBundleId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  addonIds: z.array(z.string()).optional(),
}).refine(
  (data) => data.storeServiceId || data.storeBundleId,
  { message: "Either storeServiceId or storeBundleId is required" }
).refine(
  (data) => !(data.storeServiceId && data.storeBundleId),
  { message: "Provide only one of storeServiceId or storeBundleId" }
)

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})

export const CartValidation = {
  addItemSchema,
  updateQuantitySchema,
};