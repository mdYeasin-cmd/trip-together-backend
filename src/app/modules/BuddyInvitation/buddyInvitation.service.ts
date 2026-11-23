import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "../../constants/travel-buddy-request";
import { orm } from "../../../prisma/db";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getInvitationEligibilityFromDB = async (
  tripId: string,
  userId: string,
) => {
  const trip = await orm.Trip.select("id", "userId").first({ id: tripId });

  if (!trip) {
    throw new ApiError(404, "Trip is not found.");
  }

  if (trip.userId === userId) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Owner cannot invite themselves to their own trip.",
    );
  }

  const existingInvitation = await orm.TravelBuddyRequest.select(
    "status",
  ).first({
    tripId: tripId,
    userId: userId,
  });

  if (!existingInvitation) {
    return {
      eligible: true,
    };
  }

  if (existingInvitation.status === "PENDING") {
    throw new ApiError(httpStatus.CONFLICT, "Invitation already pending.");
  }

  if (existingInvitation.status === "APPROVED") {
    throw new ApiError(httpStatus.CONFLICT, "Already joined this trip.");
  }

  return {
    eligible: true,
  };
};

const inviteTravelBuddyIntoDB = async (
  userId: string,
  tripId: string,
  buddyId: string,
) => {
  if (userId === buddyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot invite yourself.");
  }

  // userId = trip creator userId
  const trip = await orm.Trip.select("id").first({
    id: tripId,
    userId: userId,
  });

  if (!trip) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Trip not found or you are not authorized.",
    );
  }

  const buddy = await orm.User.select("id").first({
    id: buddyId,
  });

  if (!buddy) {
    throw new ApiError(httpStatus.NOT_FOUND, "Traveler not found.");
  }

  const existingRequest = await orm.TravelBuddyRequest.select("id").first({
    tripId,
    userId: buddyId,
  });

  console.log(existingRequest, "existing request for invite");

  if (existingRequest) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This traveler already has a request or invite for this trip.",
    );
  }

  const result = await orm.TravelBuddyRequest.select(
    "id",
    "tripId",
    "userId",
    "invitedById",
    "type",
    "status",
    "createdAt",
  ).create({
    tripId,
    userId: buddyId,
    invitedById: userId,
    type: TravelBuddyRequestType.INVITE,
    status: TravelBuddyRequestStatus.PENDING,
  });

  return result;
};

const respondTravelBuddyInviteIntoDB = async (
  tripId: string,
  invitationId: string,
  userId: string,
  status: TravelBuddyRequestStatus,
) => {
  const count = await orm.TravelBuddyRequest.where({
    id: invitationId,
    userId,
    tripId,
    type: TravelBuddyRequestType.INVITE,
    status: TravelBuddyRequestStatus.PENDING,
    isDeleted: false,
  }).updateAndCount({
    status: status,
  });

  const result = { count };

  if (result?.count === 0) {
    const invitation = await orm.TravelBuddyRequest.select(
      "id",
      "status",
      "isDeleted",
      "userId",
      "tripId",
    ).first({
      id: invitationId,
    });

    if (!invitation || invitation?.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found.");
    }

    const currentStatus =
      invitation?.status === TravelBuddyRequestStatus.APPROVED
        ? "accept"
        : "reject";

    if (invitation.userId !== userId || invitation.tripId !== tripId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Not allowed to respond to this invitation.",
      );
    }

    throw new ApiError(
      409,
      `Invitation already ${invitation.status.toLowerCase()}.`,
    );
  }

  return result;
};

const getTripInvitationsFromDB = async (userId: string, tripId: string) => {
  // userId = trip creator userId
  const trip = await orm.Trip.select("id").first({
    id: tripId,
    userId: userId,
  });

  if (!trip) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Trip not found or you are not authorized.",
    );
  }

  const invitations = await orm.TravelBuddyRequest.select(
    "id",
    "userId",
    "tripId",
    "status",
    "type",
    "createdAt",
  )
    .include("user", (user) => user.select("id", "name", "email"))
    .where({
      tripId: tripId,
      type: TravelBuddyRequestType.INVITE,
      isDeleted: false,
    })
    .all();

  return invitations;
};

const getInvitationHistoryFromDB = async (userId: string) => {
  const invitations = await orm.TravelBuddyRequest.select(
    "id",
    "userId",
    "tripId",
    "status",
    "type",
    "createdAt",
  )
    .include("trip", (trip) => trip.select("id"))
    .where({
      userId: userId,
      type: TravelBuddyRequestType.INVITE,
      isDeleted: false,
    })
    .all();

  return invitations;
};

export const BuddyInvitationServices = {
  getTripInvitationsFromDB,
  inviteTravelBuddyIntoDB,
  respondTravelBuddyInviteIntoDB,
  getInvitationEligibilityFromDB,
  getInvitationHistoryFromDB,
};
