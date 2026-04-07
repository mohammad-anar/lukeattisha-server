import { z } from "zod";

export const addItemSchema = z.object({
  serviceId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  addonIds: z.array(z.string()).optional(),
}).refine(
  (data) => data.serviceId || data.bundleId,
  { message: "Either serviceId or bundleId is required" }
).refine(
  (data) => !(data.serviceId && data.bundleId),
  { message: "Provide only one of serviceId or bundleId" }
)


export const CartValidation = {
  addItemSchema,
};