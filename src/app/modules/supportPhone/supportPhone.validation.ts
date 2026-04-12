import { z } from 'zod';

const createSupportPhoneValidation = z.object({

  number: z.string({
    message: 'Phone number is required',
  }),
  availableTime: z.string({
    message: 'Available time is required',
  }),
  avgWaitTime: z.string({
    message: 'Average wait time is required',
  }),
  email: z.string({
    message: 'Email is required',
  }),
  isActive: z.boolean().optional(),

});

const updateSupportPhoneValidation = z.object({

  number: z.string().optional(),
  availableTime: z.string().optional(),
  avgWaitTime: z.string().optional(),
  email: z.string().optional(),
  isActive: z.boolean().optional(),

});

export const SupportPhoneValidation = {
  createSupportPhoneValidation,
  updateSupportPhoneValidation,
};
