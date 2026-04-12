import { z } from 'zod';

const checkoutSchema = z.object({

    pickupAddress: z.object({
      pickupTime: z.string().optional(),   // set by operator later
      pickupDate: z.string().optional(),   // set by operator later
      streetAddress: z.string({ message: 'Street address is required' }),
      city: z.string({ message: 'City is required' }),
      state: z.string().optional(),
      country: z.string({ message: 'Country is required' }),
      postalCode: z.string().optional(),
    }),
    deliveryAddress: z.object({
      streetAddress: z.string({ message: 'Street address is required' }),
      city: z.string({ message: 'City is required' }),
      state: z.string().optional(),
      country: z.string({ message: 'Country is required' }),
      postalCode: z.string().optional(),
    }),
    scheduledDate: z.string({ message: 'Scheduled date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  })


const updateSchema = z.object({

    status: z.enum([
      'PENDING', 
      'PROCESSING', 
      'OUT_FOR_PICKUP', 
      'PICKED_UP', 
      'RECEIVED_BY_STORE', 
      'IN_PROGRESS', 
      'READY_FOR_DELIVERY', 
      'OUT_FOR_DELIVERY', 
      'DELIVERED', 
      'CANCELLED', 
      'REFUNDED',
      'COMPLETED'
    ]).optional(),

});

export const OrderValidation = {
  checkoutSchema,
  updateSchema,
};
