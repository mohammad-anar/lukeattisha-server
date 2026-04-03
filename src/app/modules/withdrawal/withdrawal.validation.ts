import { z } from 'zod';

const createSchema = z.object({
  amount: z.number({ message: 'Amount is required' }).min(1),
});

const updateSchema = z.object({
  status: z.enum(['HELD_IN_ESCROW', 'DISBURSED', 'RETAINED']).optional(),
  stripeTransferId: z.string().optional(),
});

export const WithdrawalValidation = {
  createSchema,
  updateSchema,
};
