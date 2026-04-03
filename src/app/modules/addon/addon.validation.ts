import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  price: z.number({ message: 'Price is required' }),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
});

export const AddonValidation = {
  createSchema,
  updateSchema,
};
