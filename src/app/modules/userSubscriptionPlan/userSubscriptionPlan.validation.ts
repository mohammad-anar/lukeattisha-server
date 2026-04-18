import { z } from 'zod';

const createSchema = z.object({
  name: z.string(),
  price: z.number(),
  duration: z.number(),
  description: z.string(),
});

const updateSchema = z.object({
  name: z.string(),
  price: z.number(),
  duration: z.number(),
  description: z.string(),
}).partial();

export const UserSubscriptionPlanValidation = {
  createSchema,
  updateSchema,
};
