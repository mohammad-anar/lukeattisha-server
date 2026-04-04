import { z } from 'zod';

const createSchema = z.object({
  name: z.string({ message: "Store name is required" }),
  address: z.string({ message: "Address is required" }).optional(),
  country: z.string({ message: "Country is required" }).optional(),
  state: z.string({ message: "State is required" }).optional(),
  city: z.string({ message: "City is required" }).optional(),
  postalCode: z.string({ message: "Postal code is required" }).optional(),
  lat: z.number({ message: "Latitude is required" }).optional(),
  lng: z.number({ message: "Longitude is required" }).optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  operatorId: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
}).partial();

export const StoreValidation = {
  createSchema,
  updateSchema,
};
