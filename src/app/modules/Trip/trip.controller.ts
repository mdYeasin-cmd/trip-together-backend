import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TripServices } from "./trip.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const TripControllers = {
  createATrip,
};
