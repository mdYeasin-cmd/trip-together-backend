import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { UserServices } from "./user.service";
import pick from "../../utils/pick";

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
  const role = req.user.role;

  const result = await UserServices.getAllUsersFromDB(role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully",
    data: result,
  });
});

const getATraveler = catchAsync(async (req: Request, res: Response) => {
  const travelerId = req.params.travelerId;

  const result = await UserServices.getATravelerFromDB(travelerId);

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
  getMyProfile,
  getAllUsers,
  getATraveler,
  updateMyProfile,
  chnageUserStatus,
};
