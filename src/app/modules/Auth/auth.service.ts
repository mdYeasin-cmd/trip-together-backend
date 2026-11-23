import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  IChangePassword,
  ILoginCredentials,
  IResetPassword,
} from "./auth.interface";
import { UserStatus } from "../../constants/user-status";
import { orm } from "../../../prisma/db";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
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
  const userData = await orm.User.first({
    email: data.email,
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
  const existingUser = await orm.User.first({
    id: userId,
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

  const result = await orm.User.where({ id: userId }).update({
    password: hashedNewPassword,
  });

  return result;
};

const forgotPasswordIntoDB = async (email: string) => {
  const existingUser = await orm.User.first({
    email: email,
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  if (existingUser.isDeleted || existingUser.status !== UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is not active.");
  }

  // Signing with the current password hash makes the token single-use:
  // once the password changes, this token can no longer be verified.
  const resetToken = jwtHelpers.generateToken(
    {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    },
    ((config.reset_pass_secret as string) + existingUser.password) as Secret,
    config.reset_pass_token_expires_in as string,
  );

  const resetLink = `${config.reset_pass_ui_link}?userId=${existingUser.id}&token=${resetToken}`;

  // TODO: Send resetLink via email once an email sender is added.
  console.log(resetLink, "Reset password link");

  return { resetLink };
};

const resetPasswordIntoDB = async (data: IResetPassword) => {
  const { token, newPassword } = data;

  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded?.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset token.");
  }

  const existingUser = await orm.User.first({
    id: decoded.id,
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  if (existingUser.isDeleted || existingUser.status !== UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is not active.");
  }

  // Throws if the token is expired, tampered with, or already used.
  jwtHelpers.verifyToken(
    token,
    ((config.reset_pass_secret as string) + existingUser.password) as Secret,
  );

  const hashedNewPassword = await bcryptHelpers.hashPassword(newPassword);

  const result = await orm.User.where({ id: existingUser.id }).update({
    password: hashedNewPassword,
    needPasswordChange: false,
  });

  return result;
};

export const AuthServices = {
  loginUserIntoDB,
  changedPasswordIntoDB,
  forgotPasswordIntoDB,
  resetPasswordIntoDB,
};
