import { z } from 'zod';

const createSchema = z.object({
  cartId: z.string({ message: 'Cart ID is required' })
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'PROCESSING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']).optional(),
});

export const OrderValidation = {
  createSchema,
  updateSchema,
};
