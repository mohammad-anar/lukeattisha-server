import { z } from 'zod';

const createSchema = z.object({
  categoryIds: z.array(z.string()),
});

const updateSchema = z.object({
  categoryId: z.string().optional(),
});

export const OperatorCategoryValidation = {
  createSchema,
  updateSchema,
};
