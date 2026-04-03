import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  categoryId: z.string({ message: 'Category ID is required' }),
  basePrice: z.number({ message: 'Base price is required' }),
  description: z.string().optional(),
  image: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  basePrice: z.number().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const ServiceValidation = {
  createSchema,
  updateSchema,
};
