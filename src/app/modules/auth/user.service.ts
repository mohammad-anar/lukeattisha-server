import { prisma } from "src/app/shared/prisma.js";
import { ILogin, IUser } from "./user.interface.js";
import generateOTP from "src/helpers.ts/generateOTP.js";
import { emailTemplate } from "src/app/shared/emailTemplate.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";
import config from "src/config/index.js";
import { Secret, SignOptions } from "jsonwebtoken";
import ApiError from "src/errors/ApiError.js";

// create users
const createUser = async (payload: IUser) => {
  const result = await prisma.user.create({
    data: payload,
    select: { id: true, name: true, email: true, role: true },
  });

  //send email
  const otp = generateOTP();
  const values = {
    name: result.name,
    otp: otp,
    email: result.email!,
  };
  const createAccountTemplate = await emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);

  return result;
};
// get all users
const getAllUsers = async () => {
  const result = await prisma.user.findMany({ where: { role: "USER" } });
  return result;
};

// get user by id
const getUserById = async (id: string) => {
  console.log("user by id");
};

// update user
const updateUser = async () => {
  console.log("updated user");
};

// delete user
const deleteUser = async (id: string) => {
  "delete user";
};

const login = async (payload: ILogin) => {
  const isExist = await prisma.user.findFirstOrThrow({
    where: { email: payload.email, status: "ACTIVE" },
    select: {
      name: true,
      email: true,
      role: true,
      isVerified: true,
      id: true,
      status: true,
    },
  });

  if (!isExist.isVerified) {
    throw new ApiError(
      403,
      "You are not verifies. Please verify your account to login",
    );
  }
  const accessToken = jwtHelper.createToken(
    isExist,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    isExist,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user: isExist };
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
