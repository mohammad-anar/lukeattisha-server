import { z } from 'zod';

const createSchema = z.object({
  // Add validation fields here
});

const updateSchema = z.object({
  // Add validation fields here
}).partial();

export const StoreValidation = {
  createSchema,
  updateSchema,
};
