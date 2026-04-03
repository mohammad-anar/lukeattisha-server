import { z } from 'zod';

const createSchema = z.object({
  serviceId: z.string({ message: 'Service ID is required' }),
  rating: z.number({ message: 'Rating is required' }).min(1).max(5),
  comment: z.string().optional(),
});

const updateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  operatorReply: z.string().optional(),
});

export const ReviewValidation = {
  createSchema,
  updateSchema,
};
