import { z } from 'zod';

const createSchema = z.object({
  operatorId: z.string({ message: 'Operator ID is required' }),
  name: z.string({ message: 'Name is required' }),
  bundlePrice: z.number({ message: 'Bundle price is required' }),
  description: z.string().optional(),
  image: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  operatorId: z.string().optional(),
  name: z.string().optional(),
  bundlePrice: z.number().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string()).optional(),
});

export const BundleValidation = {
  createSchema,
  updateSchema,
};
