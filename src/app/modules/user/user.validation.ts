import { z } from "zod";

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const UserValidation = { updateUserSchema };
