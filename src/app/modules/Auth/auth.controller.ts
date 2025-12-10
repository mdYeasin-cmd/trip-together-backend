import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerTraveller = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await AuthServices.registerTravellerIntoDB(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await AuthServices.createAdminIntoDB(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin is created successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await AuthServices.loginUserIntoDB(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const chnagePasswordData = req.body;
  const userId = req.user.id;

  const result = await AuthServices.changedPasswordIntoDB(
    userId,
    chnagePasswordData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password is changed successfully",
    data: "",
  });
});

export const AuthControllers = {
  registerTraveller,
  createAdmin,
  loginUser,
  changePassword,
};
