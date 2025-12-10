import { User, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getMyProfileFromDB = async (userId: string): Promise<Partial<User>> => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const { password, ...restUserData } = result;

  return restUserData;
};

const getAllUsersFromDB = async (
  role: UserRole
): Promise<
  Pick<User, Exclude<keyof User, "password" | "needPasswordChange">>[]
> => {
  let result: Omit<User, "password" | "needPasswordChange">[];

  if (role === UserRole.ADMIN || role === UserRole.TRAVELER) {
    result = await prisma.user.findMany({
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
  } else {
    result = await prisma.user.findMany({
      where: {
        role: {
          not: UserRole.SUPER_ADMIN,
        },
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
  }

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
  getMyProfileFromDB,
  getAllUsersFromDB,
  chnageUserStatusIntoDB,
  updateMyProfileIntoDB,
};
