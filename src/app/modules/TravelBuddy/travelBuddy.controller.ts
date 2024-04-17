import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TravelBuddyServices } from "./travelBuddy.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getTravelBuddiesByTripId = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;

    const result = await TravelBuddyServices.getTravelBuddiesByTripIdFromDB(
      tripId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Potential travel buddies retrieved successfully",
      data: result,
    });
  }
);

const respondTravelBuddyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { buddyId } = req.params;
    const data = req.body;

    const result = await TravelBuddyServices.respondTravelBuddyRequestIntoDB(
      buddyId,
      data
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel buddy request responded successfully",
      data: result,
    });
  }
);

export const TravelBuddyControllers = {
  getTravelBuddiesByTripId,
  respondTravelBuddyRequest,
};
