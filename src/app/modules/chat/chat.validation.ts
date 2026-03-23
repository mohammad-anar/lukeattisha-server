import { z } from "zod";

const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1),
    description: z.string().min(1),
    orderId: z.string().uuid().optional(),
  }),
});

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
});

export const ChatValidation = { createTicketSchema, sendMessageSchema };
