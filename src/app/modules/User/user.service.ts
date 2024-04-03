import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { IUserData } from "./user.interface";
import prisma from "../../db/prisma";

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

export const UserServices = {
  registerUserIntoDB,
};
