import { z } from "zod";

const createPackageSchema = z.object({

    name: z.string({ message: "Package name is required" }).min(1),
    price: z.number({ message: "Price is required" }).positive(),
    durationDays: z.number({ message: "Duration is required" }).int().positive(),
    freeDelivery: z.boolean().default(true),
    // Added Stripe IDs as they are now mandatory for your logic to work
    stripeProductId: z.string({ message: "Stripe Product ID is required" }).startsWith("prod_"),
    stripePriceId: z.string({ message: "Stripe Price ID is required" }).startsWith("price_"),

});

const updatePackageSchema = z.object({

    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    durationDays: z.number().int().positive().optional(),
    freeDelivery: z.boolean().optional(),
    stripeProductId: z.string().startsWith("prod_").optional(),
    stripePriceId: z.string().startsWith("price_").optional(),

});

const subscribeSchema = z.object({

    // Changed to required because the Service needs these to create the Stripe session
    packageId: z.string({ message: "Package ID is required" }),
    operatorId: z.string({ message: "Operator ID is required" }).optional(), 

});

export const SubscriptionValidation = { 
  createPackageSchema, 
  updatePackageSchema, 
  subscribeSchema 
};