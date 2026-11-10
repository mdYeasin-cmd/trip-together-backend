import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IUserData } from "./user.interface";
import { bcryptHelpers } from "../../utils/bcryptHelpers";
import { db, orm } from "../../../prisma/db";
import { UserRole } from "../../constants/user-role";
import { UserStatus } from "../../constants/user-status";

// system initialization check
const ensureSystemInitialized = async () => {
  const superAdmin = await orm.User.select("id").first({
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isDeleted: false,
  });

  if (!superAdmin) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "System is not initialized. Please contact with super admin.",
    );
  }
};

const registerTravellerIntoDB = async (data: IUserData) => {
  await ensureSystemInitialized();

  const { name, email, password } = data;

  const existingUser = await orm.User.select("id").first({ email });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Traveler already exists.");
  }

  const hashedPassword = await bcryptHelpers.hashPassword(password);

  const result = await db.transaction(async (tx) => {
    const txOrm = tx.orm.public;

    const user = await txOrm.User.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.TRAVELER,
    });

    await txOrm.UserProfile.create({
      userId: user.id,
    });

    return user;
  });

  const { password: _password, ...restUserData } = result;

  return restUserData;
};

const createAdminIntoDB = async (data: IUserData) => {
  await ensureSystemInitialized();

  const { name, email, password } = data;

  const existingUser = await orm.User.select("id").first({ email });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Admin already exists.");
  }

  const hashedPassword = await bcryptHelpers.hashPassword(password);

  const result = await db.transaction(async (tx) => {
    const txOrm = tx.orm.public;

    const user = await txOrm.User.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await txOrm.UserProfile.create({
      userId: user.id,
    });

    return user;
  });

  const { password: _password, ...restUserData } = result;

  return restUserData;
};

const getMyProfileFromDB = async (userId: string) => {
  const result = await orm.User.firstOrThrow({ id: userId });

  const { password, ...restUserData } = result;

  return restUserData;
};

const getAllUsersFromDB = async (role: UserRole) => {
  const userListFields = [
    "id",
    "name",
    "email",
    "role",
    "status",
    "isDeleted",
    "createdAt",
    "updatedAt",
  ] as const;

  let result;

  if (role === UserRole.ADMIN || role === UserRole.TRAVELER) {
    result = await orm.User.where({
      role: UserRole.TRAVELER,
      isDeleted: false,
    })
      .orderBy((u) => u.createdAt.desc())
      .select(...userListFields)
      .all();
  } else {
    result = await orm.User.where({ isDeleted: false })
      .where((u) => u.role.neq(UserRole.SUPER_ADMIN))
      .orderBy((u) => u.createdAt.desc())
      .select(...userListFields)
      .all();
  }

  return result;
};

const getAUserFromDB = async (userId: string) => {
  const user = await orm.User.select(
    "id",
    "name",
    "email",
    "role",
    "status",
    "createdAt",
  ).first({ id: userId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Traveler not found.");
  }

  return user;
};

const chnageUserStatusIntoDB = async (data: {
  userId: string;
  status: UserStatus;
}) => {
  const user = await orm.User.select("id", "status").first({
    id: data.userId,
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

  const result = await orm.User.where({ id: data.userId }).update({
    status: data.status,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  const { password, ...restUserData } = result;

  return restUserData;
};

const updateMyProfileIntoDB = async (
  userId: string,
  data: Partial<Pick<IUserData, "name" | "email">>,
) => {
  const result = await orm.User.where({ id: userId }).update(data);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

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
