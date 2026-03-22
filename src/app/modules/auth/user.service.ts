import bcrypt from "bcryptjs";
import { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { emailTemplate } from "src/app/shared/emailTemplate.js";
import config from "src/config/index.js";
import ApiError from "src/errors/ApiError.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
import generateOTP from "src/helpers.ts/generateOTP.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import redisClient from "src/helpers.ts/redis.js";
import {
  IPaginationOptions,
  IUserFilterRequest,
} from "src/types/pagination.js";
import { ILogin, IVerifyEmail } from "./user.interface.js";


import { Response } from "express";
import { Prisma } from "@prisma/client";

// create users ================================
const createUser = async (payload: Prisma.UserCreateInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_round),
  );

  const user = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
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

  // OTP
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
// get all users ===============================================
const getAllUsers = async (
  filter: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;

  const conditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    conditions.push({
      OR: ["name", "email", "phone"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  conditions.push({ role: { not: "ADMIN" } });
  conditions.push({ isDeleted: false });

  const where = { AND: conditions };

  const data = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      userAddresses:true,
      paymentCards: true,
      orders: true,
      reviews: true,

      _count: true,
    },
  });

  const total = await prisma.user.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

/* ================= GET USER BY ID ================= */
const getUserById = async (id: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      userAddresses:true,
      paymentCards: true,
      orders: true,
      reviews: true,

      _count: true,
    },
  });
};
/* ================= ME ================= */
const getMe = async (email: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,

      userAddresses: true,
      orders: true,
      reviews: true,

      _count: true,
    },
  });
};
/* ================= UPDATE ================= */
const updateUser = async (
  id: string,
  payload: Prisma.UserUpdateInput,
) => {
  return prisma.user.update({
    where: { id },
    data: payload,
  });
};

/* ================= DELETE (SOFT) ================= */
const deleteUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      status: "INACTIVE",
    },
  });
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

/* ================= VERIFY ================= */
const verifyUser = async ({ email, otp }: IVerifyEmail) => {
  const key = `otp:${email}`;
  const stored = await redisClient.get(key);

  if (!stored) throw new Error("OTP expired");
  if (stored !== String(otp)) throw new Error("Invalid OTP");

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
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

// resendOTP =========================================
const resendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, isVerified: true },
  });

  if (!user) throw new Error("User not found");
  if (user.isVerified) return { status: "already_verified" };

  // 2. Generate new OTP
  const otp = generateOTP();

  // 3. Store OTP
  const redisKey = `otp:${email}`;
  await redisClient.set(redisKey, otp, { EX: 300 });

  // 4. Prepare email template
  const values = {
    name: user.name,
    otp,
    email: email,
  };
  const otpTemplate = await emailTemplate.createAccount(values);

  // 5. Send OTP email
  await emailHelper.sendEmail(otpTemplate);

  return { status: "Otp resend successfully" };
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      isDeleted: true,
      role: true,
      phone: true,
      userAddresses: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified || user.isDeleted) {
    throw new ApiError(
      403,
      "You are not verifies. Please verify your account to reset password",
    );
  }

  const token = jwtHelper.createToken(
    user,
    config.jwt.jwt_secret as Secret,
    "15m",
  );
  const forgetPasswordTemplate = await emailTemplate.forgetPassword({
    email,
    token,
  });

  // 5. Send OTP email
  await emailHelper.sendEmail(forgetPasswordTemplate);

  return { status: "Reset password email sent" };
};

// reset password =================================================
const resetPassword = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return null;
};

// change password =================================================
const changePassword = async (
  email: string,
  newPassword: string,
  oldPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) throw new ApiError(400, "Old password is incorrect");

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round),
  );

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return null;
};

// refresh token
const refreshToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      status: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified) {
    throw new ApiError(403, "User is not verified");
  }

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

// logout =============================================== remove access and refresh token from client side cookies
const logout = async (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return null;
};

// get all jobs of a user =============================================== add filter and search like get all users

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUser,
  deleteUser,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};
