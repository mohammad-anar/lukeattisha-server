import { z } from 'zod';
import { BannerType } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ message: 'Title is required' }).min(1, 'Title cannot be empty'),
  description: z.string().optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  buttonText: z.string().optional(),
  backgroundColor: z.string().optional().default('#FFFFFF'),
  textColor: z.string().optional().default('#000000'),
  bannerType: z.nativeEnum(BannerType, { message: 'Invalid banner type' }).optional().default(BannerType.PROMOTION),
  isActive: z.boolean().optional().default(true),
});

const updateSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  buttonText: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  bannerType: z.nativeEnum(BannerType, { message: 'Invalid banner type' }).optional(),
  isActive: z.boolean().optional(),
});

export const BannerValidation = {
  createSchema,
  updateSchema,
};
