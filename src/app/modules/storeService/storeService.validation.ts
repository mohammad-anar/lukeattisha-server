import { z } from 'zod';

const createSchema = z.object({
  // Add validation fields here
  storeId: z.string({ message: 'Store ID is required' }),
  serviceIds: z.array(z.string({ message: 'Service ID is required' })),
});

const updateSchema = z.object({
  // Add validation fields here
  storeId: z.string().optional(),
  serviceIds: z.array(z.string({ message: 'Service ID is required' })).optional(),
}).partial();

export const StoreServiceValidation = {
  createSchema,
  updateSchema,
};
