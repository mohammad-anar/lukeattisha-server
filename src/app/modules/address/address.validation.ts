import { z } from "zod";

const createSchema = z.object({
  label: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
});

const updateSchema = z.object({
  label: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const UserAddressValidation = {
  createSchema,
  updateSchema,
};
