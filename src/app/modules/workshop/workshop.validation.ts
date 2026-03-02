import { z } from "zod";

export const createWorkshopSchema = z.object({
  workshopName: z
    .string()
    .min(2, "Workshop name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  avatar: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  description: z.string().optional(),
  city: z.string().min(2, "City is required"),
  cvrNumber: z.string().min(3, "CVR number is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateWorkshopSchema = z.object({
  businessName: z.string().min(2).max(150).optional(),
  address: z.string().min(5).optional(),
  tradeLicenseNumber: z.string().min(3).max(100).optional(),
  isVerified: z.boolean().optional(),
});
