import { User, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { IChangePassword, ILoginCredentials } from "./auth.interface";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import { bcryptHelpers } from "../../utils/bcryptHelpers";
import { IUserData } from "../User/user.interface";

const registerTravellerIntoDB = async (
  data: IUserData
): Promise<Partial<User>> => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Traveller already exists.");
  }

  const hashedPassword: string = await bcrypt.hash(password, 12);

  const userData = {
    name,
    email,
    password: hashedPassword,
    role: UserRole.TRAVELER,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const user = await transactionClient.user.create({
      data: userData,
    });

    await transactionClient.userProfile.create({
      data: {
        userId: user.id,
      },
    });

    return user;
  });

  const { password: p, ...restUserData } = result;

  return restUserData;
};

const createAdminIntoDB = async (data: IUserData): Promise<Partial<User>> => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Admin already exists.");
  }

  const hashedPassword: string = await bcrypt.hash(
    password,
    config.bcrypt_salt_rounds
  );

  const userData = {
    name,
    email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const user = await transactionClient.user.create({
      data: userData,
    });

    await transactionClient.userProfile.create({
      data: {
        userId: user.id,
      },
    });

    return user;
  });

  const { password: p, ...restUserData } = result;

  return restUserData;
};

const loginUserIntoDB = async (
  data: ILoginCredentials
): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}> => {
  const userData = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    data.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password incorrect!");
  }

  const tokenData = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };

  const token = jwtHelpers.generateToken(
    tokenData,
    config.jwt_secret as Secret,
    config.expires_in as string
  );

  return {
    ...tokenData,
    token,
  };
};

const changedPasswordIntoDB = async (
  userId: string,
  changePasswordData: IChangePassword
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  const { oldPassword, newPassword } = changePasswordData;

  const isOldPasswordCorrect: boolean = await bcryptHelpers.comparePassword(
    oldPassword,
    existingUser.password
  );

  if (!isOldPasswordCorrect) {
    throw new ApiError(httpStatus.FORBIDDEN, "Old password is not correct.");
  }

  const hashedNewPassword = await bcryptHelpers.hashPassword(newPassword);

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedNewPassword,
    },
  });

  return result;
};

export const AuthServices = {
  registerTravellerIntoDB,
  createAdminIntoDB,
  loginUserIntoDB,
  changedPasswordIntoDB,
};
