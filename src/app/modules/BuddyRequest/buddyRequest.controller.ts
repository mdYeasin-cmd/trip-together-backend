import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { BuddyRequestServices } from "./buddyRequest.service";

const getTravelRequestHistroy = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result =
      await BuddyRequestServices.getTravelRequestHistroyFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel request histories retrieved successfully.",
      data: result,
    });
  },
);

const sendBuddyRequest = catchAsync(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const result = await BuddyRequestServices.sendBuddyRequestIntoDB(
    tripId,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Travel buddy request sent successfully",
    data: result,
  });
});

export const BuddyRequestControllers = {
  getTravelRequestHistroy,
  sendBuddyRequest,
};
