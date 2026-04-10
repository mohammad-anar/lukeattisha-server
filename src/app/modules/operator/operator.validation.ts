import { z } from 'zod';

const createSchema = z.object({
  userId: z.string({ message: 'User ID is required' }),
});

const updateSchema = z.object({
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  stripeAccountStatus: z.enum(['PENDING', 'ONBOARDING', 'ACTIVE', 'RESTRICTED']).optional()
});

export const OperatorValidation = {
  createSchema,
  updateSchema,
};
