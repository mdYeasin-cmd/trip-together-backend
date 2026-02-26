import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TravelBuddyServices } from "./travelBuddy.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getTravelBuddiesByTripId = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const result = await TravelBuddyServices.getTravelBuddiesByTripIdFromDB(
      userId,
      tripId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Potential travel buddies retrieved successfully",
      data: result,
    });
  },
);

const sendTravelBuddyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const { userId } = req.body;

    const result = await TravelBuddyServices.sendTravelBuddyRequestIntoDB(
      tripId,
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Travel buddy request sent successfully",
      data: result,
    });
  },
);

const respondTravelBuddyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { buddyId } = req.params;
    const data = req.body;

    const result = await TravelBuddyServices.respondTravelBuddyRequestIntoDB(
      buddyId,
      data,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel buddy request responded successfully",
      data: result,
    });
  },
);

const getRequestEligibility = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const result = await TravelBuddyServices.getRequestEligibilityFromDB(
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

const getTravelRequestHistroy = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result =
      await TravelBuddyServices.getTravelRequestHistroyFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel request histories retrieved successfully.",
      data: result,
    });
  },
);

const getTravelBuddyRequests = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { tripId } = req.params;

    const result = await TravelBuddyServices.getTravelBuddyRequestsFromDB(
      userId,
      tripId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel buddy requests retrieved successfully.",
      data: result,
    });
  },
);

const inviteTravelBuddy = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { tripId } = req.params;
  const { buddyId } = req.body;

  const result = await TravelBuddyServices.inviteTravelBuddyIntoDB(
    userId,
    tripId,
    buddyId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel buddy is invited successfully.",
    data: result,
  });
});

const respondTravelBuddyInvite = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { invitationId } = req.params;
    const { tripId, status } = req.body;

    const result = await TravelBuddyServices.respondTravelBuddyInviteIntoDB(
      tripId,
      invitationId,
      userId,
      status,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel buddy invitation respond successfully.",
      data: result,
    });
  },
);

export const TravelBuddyControllers = {
  getTravelBuddiesByTripId,
  sendTravelBuddyRequest,
  respondTravelBuddyRequest,
  getRequestEligibility,
  getTravelRequestHistroy,
  getTravelBuddyRequests,
  inviteTravelBuddy,
  respondTravelBuddyInvite,
};
