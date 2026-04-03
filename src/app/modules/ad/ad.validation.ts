import { z } from 'zod';

const createSchema = z.object({
  subscriptionId: z.string({ message: 'Subscription ID is required' }),
  serviceId: z.string().optional(),
  bundleId: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED']).optional(),
});

export const AdValidation = {
  createSchema,
  updateSchema,
};
