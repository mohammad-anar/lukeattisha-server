import { z } from 'zod';

const createOrderIssueValidation = z.object({
  orderId: z.string({
    message: 'Order ID is required',
  }),
  issueTitle: z.string().optional(),
  description: z.string({
    message: 'Description is required',
  }),
  images: z.array(z.string()).optional(),
});

const updateOrderIssueValidation = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'ESCALATED', 'REFUNDED']).optional(),
  operatorNote: z.string().optional(),
  adminNote: z.string().optional(),
  isEscalated: z.boolean().optional(),
  escalationNote: z.string().optional(),
  refundAmount: z.number().optional(),

  // For operator/admin responses
  action: z.enum(['REFUND', 'ESCALATE', 'PARTIAL_REFUND', 'SOLVE']).optional(),
  amount: z.number().optional(),
  note: z.string().optional(),
});

export const OrderIssueValidation = {
  createOrderIssueValidation,
  updateOrderIssueValidation,
};
