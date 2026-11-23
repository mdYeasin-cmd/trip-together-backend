import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { BuddyInvitationServices } from "./buddyInvitation.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getInvitationEligibility = catchAsync(
  async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const result = await BuddyInvitationServices.getInvitationEligibilityFromDB(
      tripId,
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invitation eligibility check is successful.",
      data: result,
    });
  },
);

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

const getTripInvitations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { tripId } = req.params;

  const result = await BuddyInvitationServices.getTripInvitationsFromDB(
    userId,
    tripId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Trip invitations retrieved successfully.",
    data: result,
  });
});

const getInvitationHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result =
    await BuddyInvitationServices.getInvitationHistoryFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invitation history retrieved successfully.",
    data: result,
  });
});

export const BuddyInvitationControllers = {
  getTripInvitations,
  inviteTravelBuddy,
  respondTravelBuddyInvite,
  getInvitationEligibility,
  getInvitationHistory,
};
