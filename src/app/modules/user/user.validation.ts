import { z } from 'zod';

const createAdminSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  email: z.string({ message: 'Email is required' }).email(),
  password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const createOperatorSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  email: z.string({ message: 'Email is required' }).email(),
  password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', "BANNED", 'SUSPENDED']).optional(),
  isVerified: z.boolean().optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  isSubscribed: z.boolean().optional(),
});

export const UserValidation = {
  createAdminSchema,
  createOperatorSchema,
  updateSchema,
};
