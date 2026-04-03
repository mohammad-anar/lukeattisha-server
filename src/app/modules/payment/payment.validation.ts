import { z } from 'zod';

const createSchema = z.object({
  orderId: z.string({ message: 'Order ID is required' }),
});

const updateSchema = z.object({
  status: z.enum(['UNPAID', 'PAID', 'ESCROW_HELD', 'DISBURSED', 'REFUNDED']).optional(),
});

export const PaymentValidation = {
  createSchema,
  updateSchema,
};
