import { z } from "zod";

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    method: z.enum(["CARD", "APPLE_PAY", "GOOGLE_PAY"]),
    transactionId: z.string().optional(),
  }),
});

const addCardSchema = z.object({
  body: z.object({
    stripeMethodId: z.string().min(1),
    last4: z.string().length(4),
    brand: z.string().min(1),
  }),
});

export const PaymentValidation = { createPaymentSchema, addCardSchema };
