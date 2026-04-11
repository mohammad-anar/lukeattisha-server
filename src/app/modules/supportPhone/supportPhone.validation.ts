import { z } from 'zod';

const createSupportPhoneValidation = z.object({

  number: z.string({
    message: 'Phone number is required',
  }),
  isActive: z.boolean().optional(),

});

const updateSupportPhoneValidation = z.object({

  number: z.string().optional(),
  isActive: z.boolean().optional(),

});

export const SupportPhoneValidation = {
  createSupportPhoneValidation,
  updateSupportPhoneValidation,
};
