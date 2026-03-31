import { z } from "zod";

const createTicketSchema = z.object({

    subject: z.string(),
    description: z.string(),
    orderId: z.string().optional(),
    type: z.enum(["ORDER_ISSUE", "GENERAL"]).optional(),

});

const updateTicketStatusSchema = z.object({

    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),

});

const addMessageSchema = z.object({

    content: z.string(),

});

export const TicketValidation = {
  createTicketSchema,
  updateTicketStatusSchema,
  addMessageSchema,
};
