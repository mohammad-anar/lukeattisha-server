import { z } from 'zod';

const createSchema = z.object({
  storeId: z.string({ message: 'Store ID is required' }),
  addressId: z.string({ message: 'Address ID is required' }),
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'PROCESSING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']).optional(),
});

export const OrderValidation = {
  createSchema,
  updateSchema,
};
