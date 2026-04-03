import { z } from 'zod';

const createSchema = z.object({
  storeId: z.string({ message: 'Store ID is required' }),
});

const updateSchema = z.object({
  storeId: z.string().optional(),
});

export const CartValidation = {
  createSchema,
  updateSchema,
};
