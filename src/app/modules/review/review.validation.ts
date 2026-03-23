import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    orderId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

const replySchema = z.object({
  body: z.object({
    operatorReply: z.string().min(1),
  }),
});

export const ReviewValidation = { createReviewSchema, replySchema };
