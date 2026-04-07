import { z } from 'zod';

const createSchema = z.object({
  storeServiceId: z.string({ message: 'Store Service ID is required' }).optional(),
  storeBundleId: z.string({ message: 'Store Bundle ID is required' }).optional(),
  rating: z.number({ message: 'Rating is required' }).min(1).max(5),
  comment: z.string().optional(),
}).refine((data) => data.storeServiceId || data.storeBundleId, {
  message: 'Either storeServiceId or storeBundleId must be provided',
  path: ['storeServiceId', 'storeBundleId'],
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
