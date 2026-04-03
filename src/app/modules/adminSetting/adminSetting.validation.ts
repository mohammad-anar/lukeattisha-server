import { z } from 'zod';

const createSchema = z.object({
  platformCommissionRate: z.number().min(0).max(1).optional(),
  payoutSchedule: z.string().optional(),
});

const updateSchema = z.object({
  platformCommissionRate: z.number().min(0).max(1).optional(),
  payoutSchedule: z.string().optional(),
});

export const AdminSettingValidation = {
  createSchema,
  updateSchema,
};
