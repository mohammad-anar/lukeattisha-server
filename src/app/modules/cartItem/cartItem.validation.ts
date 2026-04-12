import { z } from 'zod';

const createSchema = z.object({
  cartId: z.string({ message: 'Cart ID is required' }),
  storeServiceId: z.string().optional(),
  storeBundleId: z.string().optional(),
  quantity: z.number({ message: 'Quantity is required' }).int().min(1),
  price: z.number({ message: 'Price is required' }),
});

const updateSchema = z.object({
  quantity: z.number().int().min(1).optional(),
});

export const CartItemValidation = {
  createSchema,
  updateSchema,
};
