import { OrderStatus } from "@prisma/client";
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
        }),
      )
      .min(1),
    pickupAt: z.string().min(1), // ISO string or any date string
    dropoffAt: z.string().min(1), // ISO string
    pickupAddress: z.string().min(1),
    dropoffAddress: z.string().min(1),
    pickupLatitude: z.number().optional(),
    pickupLongitude: z.number().optional(),
    dropoffLatitude: z.number().optional(),
    dropoffLongitude: z.number().optional(),
    specialInstruction: z.string().optional(),
    paymentMethod: z.enum(["CARD", "APPLE_PAY", "GOOGLE_PAY"]),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(OrderStatus),
    note: z.string().optional(),
  }),
});

export const OrderValidation = { createOrderSchema, updateOrderStatusSchema };
