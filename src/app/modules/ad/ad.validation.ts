import { z } from 'zod';

const createSchema = z.object({
  serviceId: z.string().optional(),
  bundleId: z.string().optional(),
  planId: z.string().optional(), // Optional if no active subscription found
  userLat: z.string().optional(),
  userLng: z.string().optional(),
}).refine((data) => data.serviceId || data.bundleId, {
  message: 'serviceId or bundleId is required',
  path: ['serviceId', 'bundleId'],
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED']).optional(),
});

export const AdValidation = {
  createSchema,
  updateSchema,
};
