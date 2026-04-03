import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CategoryValidation = {
  createSchema,
  updateSchema,
};
