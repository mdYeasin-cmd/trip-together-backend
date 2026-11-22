import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "../../constants/travel-buddy-request";
import { orm } from "../../../prisma/db";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getTravelBuddiesByTripIdFromDB = async (
  userId: string,
  tripId: string,
) => {
  // only trip owner can see travel buddies requests associated with trip
  const trip = await orm.Trip.first({
    id: tripId,
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  if (trip.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to see this trip's travel buddies requests.",
    );
  }

  const result = await orm.TravelBuddyRequest.where({
    tripId,
  })
    .include("user", (user) => user.select("id", "name", "email"))
    .all();

  return result;
};

const sendTravelBuddyRequestIntoDB = async (tripId: string, userId: string) => {
  const [trip, user, existingRequest] = await Promise.all([
    orm.Trip.select("id", "userId").first({
      id: tripId,
    }),
    orm.User.select("id").first({
      id: userId,
    }),
    orm.TravelBuddyRequest.select("id").first({
      tripId: tripId,
      userId: userId,
    }),
  ]);

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }

  console.log(existingRequest, "existing request.");

  if (existingRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are already requested to join this trip.",
    );
  }

  if (trip.userId === userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can't send request to yourself.",
    );
  }

  const result = await orm.TravelBuddyRequest.create({
    tripId,
    userId: userId,
    type: TravelBuddyRequestType.REQUEST,
    status: TravelBuddyRequestStatus.PENDING,
  });

  return result;
};

const respondTravelBuddyRequestIntoDB = async (
  userId: string,
  requestId: string,
  data: {
    status: TravelBuddyRequestStatus;
  },
) => {
  const tripRequest = await orm.TravelBuddyRequest.select(
    "id",
    "tripId",
    "userId",
    "status",
  )
    .include("trip", (trip) => trip.select("userId"))
    .first({
      id: requestId,
    });

  if (!tripRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel buddy request not found.");
  }

  if (tripRequest.trip?.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to respond to this travel buddy request.",
    );
  }

  if (tripRequest.status !== TravelBuddyRequestStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This request has already been responded to.",
    );
  }

  const result = await orm.TravelBuddyRequest.where({
    id: requestId,
  }).update({
    status: data.status,
  });

  return result;
};

const getRequestEligibilityFromDB = async (tripId: string, userId: string) => {
  const trip = await orm.Trip.select("id", "userId").first({ id: tripId });

  if (!trip) {
    throw new ApiError(404, "Trip is not found.");
  }

  if (trip.userId === userId) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Owner cannot request to join own trip.",
    );
  }

  const existingRequest = await orm.TravelBuddyRequest.select("status").first({
    tripId: tripId,
    userId: userId,
  });

  if (!existingRequest) {
    return {
      eligible: true,
    };
  }

  if (existingRequest.status === "PENDING") {
    throw new ApiError(httpStatus.CONFLICT, "Request already pending.");
  }

  if (existingRequest.status === "APPROVED") {
    throw new ApiError(httpStatus.CONFLICT, "Already joined this trip.");
  }

  return {
    eligible: true,
  };
};

const getTravelBuddyRequestsFromDB = async (userId: string, tripId: string) => {
  // userId = trip creator userId
  const trip = await orm.Trip.select("id").first({
    id: tripId,
    userId: userId,
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "Trip not found.");
  }

  const travelBuddyRequests = await orm.TravelBuddyRequest.select(
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
      type: TravelBuddyRequestType.REQUEST,
    })
    .all();

  return travelBuddyRequests;
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
    id: userId,
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

export const BuddyInvitationServices = {
  getTravelBuddiesByTripIdFromDB,
  sendTravelBuddyRequestIntoDB,
  respondTravelBuddyRequestIntoDB,
  getRequestEligibilityFromDB,
  getTravelBuddyRequestsFromDB,
  inviteTravelBuddyIntoDB,
  respondTravelBuddyInviteIntoDB,
};
