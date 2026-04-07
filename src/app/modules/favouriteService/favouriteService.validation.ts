import { z } from 'zod';

const createSchema = z.object({
  storeServiceId: z.string().optional(),
  storeBundleId: z.string().optional(),
});

const updateSchema = z.object({
  storeServiceId: z.string().optional(),
  storeBundleId: z.string().optional(),
}).partial();

export const FavouriteServiceValidation = {
  createSchema,
  updateSchema,
};
