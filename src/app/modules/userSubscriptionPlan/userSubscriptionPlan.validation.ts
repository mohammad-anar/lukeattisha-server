import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  durationMonth: z.number({ message: 'Duration in months is required' }),
  price: z.number({ message: 'Price is required' }),
  features: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  durationMonth: z.number().optional(),
  price: z.number().optional(),
  features: z.array(z.string()).optional(),
});

export const UserSubscriptionPlanValidation = {
  createSchema,
  updateSchema,
};
