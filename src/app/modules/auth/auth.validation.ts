import { z } from "zod";

const loginSchema = z.object({

    email: z.string().email(),
    password: z.string().min(1),

});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.union([z.string(), z.number()]),
});

const forgetPasswordSchema = z.object({
 
    email: z.string().email(),

});

const resetPasswordSchema = z.object({

    password: z.string().min(8),

});

const changePasswordSchema = z.object({

    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),

});

const registerSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.string().email({ message: "Email is required" }),
  phone: z.string().optional(),
  password: z.string({ message: "Password is required" }).min(8, "Password must be at least 8 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});
const registerOperatorSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.string().email({ message: "Email is required" }),
  phone: z.string().optional(),
  password: z.string({ message: "Password is required" }).min(8, "Password must be at least 8 characters"),
  address: z.string({ message: "Address is required" }),
  storeName: z.string({ message: "Store name is required" }),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const AuthValidation = {
  loginSchema,
  verifyEmailSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  registerSchema,
  registerOperatorSchema
};
