import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { BuddyInvitationServices } from "./buddyInvitation.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

// ====================

const inviteTravelBuddy = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { tripId } = req.params;
  const { buddyId } = req.body;

  const result = await BuddyInvitationServices.inviteTravelBuddyIntoDB(
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

    const result = await BuddyInvitationServices.respondTravelBuddyInviteIntoDB(
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

// ====================

const getTravelBuddiesByTripId = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const result = await BuddyInvitationServices.getTravelBuddiesByTripIdFromDB(
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
    const userId = req.user.id;

    const result = await BuddyInvitationServices.sendTravelBuddyRequestIntoDB(
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
    const { requestId } = req.params;
    const data = req.body;
    const userId = req.user.id;

    const result =
      await BuddyInvitationServices.respondTravelBuddyRequestIntoDB(
        userId,
        requestId,
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

    const result = await BuddyInvitationServices.getRequestEligibilityFromDB(
      tripId,
      userId,
    );

    console.log(result, "from controller");

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Request eligibility check is successful.",
      data: result,
    });
  },
);

const getTravelBuddyRequests = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { tripId } = req.params;

    const result = await BuddyInvitationServices.getTravelBuddyRequestsFromDB(
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

export const BuddyInvitationControllers = {
  getTravelBuddiesByTripId,
  sendTravelBuddyRequest,
  respondTravelBuddyRequest,
  getRequestEligibility,
  getTravelBuddyRequests,
  inviteTravelBuddy,
  respondTravelBuddyInvite,
};
