import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TripServices } from "./trip.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../../utils/pick";

const createATrip = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;

  const result = await TripServices.createATripIntoDB(userId, data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Trip created successfully",
    data: result,
  });
});

const getAllTrips = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "destination",
    "startDate",
    "endDate",
    "minBudget",
    "maxBudget",
    "searchTerm",
  ]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await TripServices.getAllTripsFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Trips retrieved successfully",
    data: result,
  });
});

const sendTravelBuddyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const data = req.body;

    const result = await TripServices.sendTravelBuddyRequestIntoDB(
      tripId,
      data
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Travel buddy request sent successfully",
      data: result,
    });
  }
);

export const TripControllers = {
  createATrip,
  getAllTrips,
  sendTravelBuddyRequest,
};
