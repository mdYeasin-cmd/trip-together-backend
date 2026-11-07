import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { BuddyRequestServices } from "./buddyRequest.service";

const getBuddyRequestHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result =
      await BuddyRequestServices.getBuddyRequestHistoryFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Buddy request histories retrieved successfully.",
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
    message: "Buddy request sent successfully",
    data: result,
  });
});

const getRequestEligibility = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const result = await BuddyRequestServices.getRequestEligibilityFromDB(
      tripId,
      userId,
    );

    console.log(result, "from controller");

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reequest eligibility check is successfull.",
      data: result,
    });
  },
);

const respondBuddyRequest = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const data = req.body;
  const userId = req.user.id;

  const result = await BuddyRequestServices.respondBuddyRequestIntoDB(
    userId,
    requestId,
    data,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Buddy request responded successfully",
    data: result,
  });
});

const getBuddyRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { tripId } = req.params;

  const result = await BuddyRequestServices.getBuddyRequestsFromDB(
    userId,
    tripId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Buddy requests retrieved successfully.",
    data: result,
  });
});

export const BuddyRequestControllers = {
  getBuddyRequestHistory,
  sendBuddyRequest,
  getRequestEligibility,
  respondBuddyRequest,
  getBuddyRequests,
};
