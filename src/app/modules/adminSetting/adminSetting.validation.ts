import { z } from "zod";

const createAdminSettingSchema = z.object({
  id: z.string().optional(),
  platformCommissionRate: z.number().min(0).max(100).optional(), // % or decimal (0.1 = 10%)
  calcellationWindowHours: z.number().int().min(0).optional(),
  bookingLeadTimeHours: z.number().int().min(0).optional(),
  requirePaymentUpFront: z.boolean().optional(),
  allowPartialPayment: z.boolean().optional(),
  fixedTransactionFee: z.number().min(0).optional(),
  paymentProcessingFee: z.number().min(0).optional(),
  payoutSchedule: z.string().optional(), // e.g. "weekly", "daily"
});

const updateAdminSettingSchema = z.object({
  platformCommissionRate: z.number().min(0).max(100).optional(),
  calcellationWindowHours: z.number().int().min(0).optional(),
  bookingLeadTimeHours: z.number().int().min(0).optional(),
  requirePaymentUpFront: z.boolean().optional(),
  allowPartialPayment: z.boolean().optional(),
  fixedTransactionFee: z.number().min(0).optional(),
  paymentProcessingFee: z.number().min(0).optional(),
  payoutSchedule: z.string().optional(),
}).partial();

export const AdminSettingValidation = {
  createAdminSettingSchema,
  updateAdminSettingSchema,
};
