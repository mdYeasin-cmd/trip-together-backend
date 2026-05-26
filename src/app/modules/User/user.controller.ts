import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { UserServices } from "./user.service";
import pick from "../../utils/pick";
import { UserRole } from "@prisma/client";

const registerTraveller = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await UserServices.registerTravellerIntoDB(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await UserServices.createAdminIntoDB(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin is created successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await UserServices.getMyProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const role = req?.user?.role ?? UserRole.SUPER_ADMIN;

  const result = await UserServices.getAllUsersFromDB(role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully",
    data: result,
  });
});

const getAUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await UserServices.getAUserFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Traveler is retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;

  const updateableProperty = pick(data, ["name", "email"]);

  const result = await UserServices.updateMyProfileIntoDB(
    userId,
    updateableProperty,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const chnageUserStatus = catchAsync(async (req: Request, res: Response) => {
  const statusChangeData = req.body;

  const result = await UserServices.chnageUserStatusIntoDB(statusChangeData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status is changed successfully",
    data: result,
  });
});

export const UserControllers = {
  registerTraveller,
  createAdmin,
  getMyProfile,
  getAllUsers,
  getAUser,
  updateMyProfile,
  chnageUserStatus,
};
