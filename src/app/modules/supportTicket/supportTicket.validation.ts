import { z } from 'zod';

const createSchema = z.object({
  subject: z.string({ message: 'Subject is required' }),
  description: z.string({ message: 'Description is required' }),
  orderId: z.string().optional(),
  type: z.enum(['ORDER_ISSUE', 'PAYMENT_ISSUE', 'GENERAL']).optional(),
});

const updateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});

export const SupportTicketValidation = {
  createSchema,
  updateSchema,
};
