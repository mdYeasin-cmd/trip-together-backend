import { User, UserRole, UserStatus } from "@prisma/client";
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

const getAllUsersFromDB = async (): Promise<
  Pick<User, Exclude<keyof User, "password" | "needPasswordChange">>[]
> => {
  const result = await prisma.user.findMany({
    where: {
      role: UserRole.TRAVELER,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const chnageUserStatusIntoDB = async (data: {
  userId: string;
  status: UserStatus;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  if (user.status === data.status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `User is already ${data.status}.`
    );
  }

  const result = await prisma.user.update({
    where: {
      id: data.userId,
    },
    data: {
      status: data.status,
    },
  });

  return result;
};

export const UserServices = {
  registerUserIntoDB,
  createAdminIntoDB,
  loginUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
  getAllUsersFromDB,
  chnageUserStatusIntoDB,
};
