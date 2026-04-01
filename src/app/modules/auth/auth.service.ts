import bcrypt from "bcryptjs";
import { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { Response } from "express";
import { ILogin, IVerifyEmail } from "./auth.interface.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import generateOTP from "../../../helpers.ts/generateOTP.js";
import redisClient from "../../../helpers.ts/redis.js";
import { emailTemplate } from "../../shared/emailTemplate.js";
import { emailHelper } from "../../../helpers.ts/emailHelper.js";
import ApiError from "../../../errors/ApiError.js";
import { jwtHelper } from "../../../helpers.ts/jwtHelper.js";
import { config } from "config/index.js";

/* ================= REGISTER ================= */
const register = async (payload: Prisma.UserCreateInput & {address: string}) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_round),
  );

  const {address, ...userData} = payload;

//  prisma transaction

const user = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { ...userData, password: hashedPassword},
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  });

  await tx.userAddress.create({
    data: { userId: user.id, address },
  });

  return user;
});

  const otp = generateOTP();
  await redisClient.set(`otp:${user.email}`, otp, { EX: 300 });

  const emailData = await emailTemplate.createAccount({
    name: user.name,
    otp,
    email: user.email!,
  });
  await emailHelper.sendEmail(emailData);

  return user;
};
/* ================= REGISTER OPERATOR ================= */
import { createStripeAccount } from "../../../helpers.ts/stripeHelpers.js";

const registerOperator = async (payload: Prisma.UserCreateInput & {address: string, storeName: string}) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_round),
  );

  const { name, email, password, phone, address, storeName } = payload;

  // 1. Pre-create Stripe account to ensure it works before DB write
  const stripeAccountId = await createStripeAccount(email);

  // use prisma transaction
  const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: hashedPassword, phone, role: "OPERATOR" },
      select: {
        id: true,
        name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  });

  await tx.operatorProfile.create({
    data: { 
      userId: user.id, 
      storeName, 
      address,
      stripeAccountId // ✅ Link Stripe Account Here
    },
  });

    await tx.userAddress.create({
      data: { userId: user.id, address },
    });

    return user;
  });

  const otp = generateOTP();
  await redisClient.set(`otp:${user.email}`, otp, { EX: 300 });

  const emailData = emailTemplate.createAccount({
    name: user.name,
    otp,
    email: user.email!,
  });
  await emailHelper.sendEmail(emailData);

  return user;
};

/* ================= LOGIN ================= */
const login = async (payload: ILogin) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { email: payload.email, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      isVerified: true,
    },
  });

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");
  if (!user.isVerified) throw new ApiError(403, "Verify account first");

  const { password, ...safeUser } = user;

  const accessToken = jwtHelper.createToken(
    safeUser,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    safeUser,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user: safeUser };
};

/* ================= VERIFY EMAIL ================= */
const verifyUser = async ({ email, otp }: IVerifyEmail) => {
  const key = `otp:${email}`;
  const stored = await redisClient.get(key);

  if (!stored) throw new Error("OTP expired");
  if (stored !== String(otp)) throw new Error("Invalid OTP");

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  });
  await redisClient.del(key);

  const accessToken = jwtHelper.createToken(
    user,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    user,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user };
};

/* ================= RESEND OTP ================= */
const resendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, isVerified: true },
  });
  if (!user) throw new Error("User not found");
  if (user.isVerified) return { status: "already_verified" };

  const otp = generateOTP();
  await redisClient.set(`otp:${email}`, otp, { EX: 300 });

  const otpTemplate = await emailTemplate.createAccount({ name: user.name, otp, email });
  await emailHelper.sendEmail(otpTemplate);

  return { status: "OTP resent successfully" };
};

/* ================= FORGET PASSWORD ================= */
const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isVerified: true, isDeleted: true, role: true, phone: true, userAddresses: true, avatar: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified || user.isDeleted) {
    throw new ApiError(403, "Account not verified or deleted");
  }

  const token = jwtHelper.createToken(user, config.jwt.jwt_secret as Secret, "15m");
  const template = await emailTemplate.forgetPassword({ email, token });
  await emailHelper.sendEmail(template);

  return { status: "Reset password email sent" };
};

/* ================= FORGET PASSWORD OTP ================= */
const forgetPasswordOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isVerified: true, isDeleted: true },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified || user.isDeleted) {
    throw new ApiError(403, "Account not verified or deleted");
  }

  const otp = generateOTP();
  await redisClient.set(`otp:${email}`, otp, { EX: 180 }); // 3 minutes

  const template = await emailTemplate.resetPassword({ email, otp });
  await emailHelper.sendEmail(template);

  return { status: "OTP sent successfully" };
};

/* ================= VERIFY OTP ================= */
const verifyOTP = async (email: string, otp: string) => {
  const key = `otp:${email}`;
  const stored = await redisClient.get(key);

  if (!stored) throw new ApiError(400, "OTP expired");
  if (stored !== String(otp)) throw new ApiError(400, "Invalid OTP");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = jwtHelper.createToken(
    user as JwtPayload,
    config.jwt.jwt_secret as Secret,
    "15m"
  );

  await redisClient.del(key);

  return { resetToken };
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

  return null;
};

/* ================= CHANGE PASSWORD ================= */
const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new ApiError(400, "Old password is incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_round));
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

  return null;
};

/* ================= REFRESH TOKEN ================= */
const refreshToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, status: true },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified) throw new ApiError(403, "User is not verified");

  const accessToken = jwtHelper.createToken(
    user as JwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    user as JwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user };
};

/* ================= LOGOUT ================= */
const logout = async (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return null;
};

export const AuthService = {
  register,
  registerOperator,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  forgetPasswordOTP,
  verifyOTP,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};
