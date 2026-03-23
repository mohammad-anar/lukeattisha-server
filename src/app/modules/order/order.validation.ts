import { z } from "zod";

const createOrderSchema = z.object({
  body: z.object({
    operatorId: z.string().uuid(),
    items: z
      .array(
        z.object({
          serviceId: z.string().uuid(),
          quantity: z.number().int().min(1),
          addonIds: z.array(z.string().uuid()).optional(),
        })
      )
      .min(1),
    pickupDate: z.string(),
    pickupTimeRange: z.string().min(1),
    pickupAddress: z.string().min(1),
    pickupLat: z.number().optional(),
    pickupLng: z.number().optional(),
    specialInstruction: z.string().optional(),
    paymentMethod: z.enum(["CARD", "APPLE_PAY", "GOOGLE_PAY"]),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "ACCEPTED", "IN_PROGRESS", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "DISPUTED", "REFUNDED"]),
    note: z.string().optional(),
  }),
});

export const OrderValidation = { createOrderSchema, updateOrderStatusSchema };
