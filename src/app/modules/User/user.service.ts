import { User, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IUserData } from "./user.interface";
import { bcryptHelpers } from "../../utils/bcryptHelpers";

const registerTravellerIntoDB = async (
  data: IUserData,
): Promise<Partial<User>> => {
  // system initialization check
  const superAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!superAdmin) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "System is not initialized. Please contact with super admin.",
    );
  }

  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Traveller already exists.");
  }

  const hashedPassword = await bcryptHelpers.hashPassword(password);

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
  // system initialization check
  const superAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!superAdmin) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "System is not initialized. Please contact with super admin.",
    );
  }

  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Admin already exists.");
  }

  const hashedPassword = await bcryptHelpers.hashPassword(password);

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

const getMyProfileFromDB = async (userId: string): Promise<Partial<User>> => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const { password, ...restUserData } = result;

  return restUserData;
};

const getAllUsersFromDB = async (
  role: UserRole,
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

const getAUserFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Traveler not found.");
  }

  return user;
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
      `User is already ${data.status}.`,
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
  data: Partial<User>,
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
  registerTravellerIntoDB,
  createAdminIntoDB,
  getMyProfileFromDB,
  getAllUsersFromDB,
  getAUserFromDB,
  chnageUserStatusIntoDB,
  updateMyProfileIntoDB,
};
