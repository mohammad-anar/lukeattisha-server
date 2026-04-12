import { z } from 'zod';

const createSchema = z.object({
  storeServiceId: z.string().optional(),
  storeBundleId: z.string().optional(),
  planId: z.string().optional(), // Optional if no active subscription found
  userLat: z.string().optional(),
  userLng: z.string().optional(),
}).refine((data) => data.storeServiceId || data.storeBundleId, {
  message: 'serviceId or bundleId is required',
  path: ['storeServiceId', 'storeBundleId'],
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED']).optional(),
});

export const AdValidation = {
  createSchema,
  updateSchema,
};
