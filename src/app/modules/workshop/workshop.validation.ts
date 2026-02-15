import { z } from "zod";
export const createWorkshopSchema = z.object({
  userId: z.string().uuid(),
  businessName: z.string().min(2).max(150),
  address: z.string().min(5),
  tradeLicenseNumber: z.string().min(3).max(100),
  isVerified: z.boolean().optional(),
});

export const updateWorkshopSchema = z.object({
  businessName: z.string().min(2).max(150).optional(),
  address: z.string().min(5).optional(),
  tradeLicenseNumber: z.string().min(3).max(100).optional(),
  isVerified: z.boolean().optional(),
});
