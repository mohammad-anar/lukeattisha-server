import { z } from "zod";

const createBannerZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  bannerType: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  isActive: z.boolean().optional(),
  image: z.string().optional(),
});

const updateBannerZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  bannerType: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  isActive: z.boolean().optional(),
  image: z.string().optional(),
});

export const BannerValidation = {
  createBannerZodSchema,
  updateBannerZodSchema,
};
