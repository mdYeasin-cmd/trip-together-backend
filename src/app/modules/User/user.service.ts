import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { ILoginCredentials, IUserData } from "./user.interface";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";

const registerUserIntoDB = async (data: IUserData): Promise<Partial<User>> => {
  const { name, email, password, profile } = data;

  const hashedPassword: string = await bcrypt.hash(password, 12);

  const userData = {
    name,
    email,
    password: hashedPassword,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const user = await transactionClient.user.create({
      data: userData,
    });

    profile.userId = user.id;

    await transactionClient.userProfile.create({
      data: profile,
    });

    return user;
  });

  const { password: p, ...restUserData } = result;

  return restUserData;
};

const loginUserIntoDB = async (data: ILoginCredentials) => {
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

export const UserServices = {
  registerUserIntoDB,
  loginUserIntoDB,
};
