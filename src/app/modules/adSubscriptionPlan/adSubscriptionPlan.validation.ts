import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  durationMonth: z.number({ message: 'Duration in months is required' }).int().min(1),
  price: z.number({ message: 'Price is required' }).min(0),
});

const updateSchema = z.object({
  name: z.string().optional(),
  durationMonth: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
});

export const AdSubscriptionPlanValidation = {
  createSchema,
  updateSchema,
};
