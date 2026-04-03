import { z } from 'zod';

const createSchema = z.object({
  userId: z.string({ message: 'User ID is required' }),
});

const updateSchema = z.object({
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  onboardingComplete: z.boolean().optional(),
});

export const OperatorValidation = {
  createSchema,
  updateSchema,
};
