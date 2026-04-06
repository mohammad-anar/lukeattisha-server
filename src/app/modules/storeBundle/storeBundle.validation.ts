import { z } from 'zod';

const createSchema = z.object({
  // Add validation fields here
  storeId: z.string({ message: 'Store ID is required' }),
  bundleIds: z.array(z.string({ message: 'Bundle ID is required' })),
});

const updateSchema = z.object({
  // Add validation fields here
  storeId: z.string().optional(),
  bundleIds: z.array(z.string({ message: 'Bundle ID is required' })).optional(),
}).partial();

export const StoreBundleValidation = {
  createSchema,
  updateSchema,
};
