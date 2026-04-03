import { z } from 'zod';

const createSchema = z.object({
  streetAddress: z.string({ message: 'Street address is required' }),
  city: z.string({ message: 'City is required' }),
  state: z.string().optional(),
  country: z.string({ message: 'Country is required' }),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateSchema = z.object({
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const AddressValidation = {
  createSchema,
  updateSchema,
};
