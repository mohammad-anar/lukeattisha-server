import { z } from 'zod';

const createSchema = z.object({
  // Add validation fields here
});

const updateSchema = z.object({
  // Add validation fields here
}).partial();

const createCheckoutSessionSchema = z.object({
  planId: z.string({ message: 'Plan ID is required' }),
});

export const AdSubscriptionValidation = {
  createSchema,
  updateSchema,
  createCheckoutSessionSchema,
};
