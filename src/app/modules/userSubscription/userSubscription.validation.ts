import { z } from 'zod';

const createSchema = z.object({
  userId: z.string({ message: 'User ID is required' }),
  planId: z.string({ message: 'Plan ID is required' }),
  startDate: z.string({ message: 'Start date is required' }).transform(val => new Date(val)),
  endDate: z.string({ message: 'End date is required' }).transform(val => new Date(val)),
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
  stripePaymentId: z.string().optional(),
});

const updateSchema = z.object({
  userId: z.string().optional(),
  planId: z.string().optional(),
  startDate: z.string().transform(val => new Date(val)).optional(),
  endDate: z.string().transform(val => new Date(val)).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
  stripePaymentId: z.string().optional(),
}).partial();

const activateIAPSchema = z.object({
  planId: z.string({ message: 'Plan ID is required' }),
  receiptData: z.string({ message: 'Receipt data is required' }),
});

export const UserSubscriptionValidation = {
  createSchema,
  updateSchema,
  activateIAPSchema,
};
