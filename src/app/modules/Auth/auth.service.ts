import bcrypt from "bcrypt";
import { IChangePassword, ILoginCredentials } from "./auth.interface";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import { bcryptHelpers } from "../../utils/bcryptHelpers";

const loginUserIntoDB = async (
  data: ILoginCredentials,
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
    userData.password,
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
    config.expires_in as string,
  );

  return {
    ...tokenData,
    token,
  };
};

const changedPasswordIntoDB = async (
  userId: string,
  changePasswordData: IChangePassword,
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
    existingUser.password,
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
  loginUserIntoDB,
  changedPasswordIntoDB,
};
