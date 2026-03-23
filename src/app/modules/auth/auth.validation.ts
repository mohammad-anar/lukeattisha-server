import { z } from "zod";

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.union([z.string(), z.number()]),
  }),
});

const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

const registerSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.email({ message: "Email is required" }),
  phone: z.string().optional(),
  password: z.string({ message: "Password is required" }).min(8, "Password must be at least 8 characters"),
  avatar: z.string().optional(),
  address: z.string().optional(),
});

export const AuthValidation = {
  loginSchema,
  verifyEmailSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  registerSchema,
};
