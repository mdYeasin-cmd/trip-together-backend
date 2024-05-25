import { User, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { ILoginCredentials, IUserData } from "./user.interface";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";

const registerUserIntoDB = async (data: IUserData): Promise<Partial<User>> => {
  const { name, email, password } = data;

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

  const hashedPassword: string = await bcrypt.hash(password, 12);

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
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: data.email,
    },
  });

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

const getMyProfileFromDB = async (userId: string): Promise<Partial<User>> => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const { password, ...restUserData } = result;

  return restUserData;
};

const updateMyProfileIntoDB = async (
  userId: string,
  data: Partial<User>
): Promise<Partial<User>> => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const result = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const { password, ...restUserData } = result;

  return restUserData;
};

export const UserServices = {
  registerUserIntoDB,
  createAdminIntoDB,
  loginUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};
