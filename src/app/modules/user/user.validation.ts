import { z } from "zod";

const updateUserSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    address: z.string().optional(),
});

export const UserValidation = { updateUserSchema };
