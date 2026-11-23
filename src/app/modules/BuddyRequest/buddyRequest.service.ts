import httpStatus from "http-status";
import { orm } from "../../../prisma/db";
import ApiError from "../../errors/ApiError";
import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "../../constants/travel-buddy-request";

const getBuddyRequestHistoryFromDB = async (userId: string) => {
  const result = await orm.TravelBuddyRequest.where({
    userId: userId,
  })
    .include("trip", (trip) =>
      trip.select(
        "id",
        "destination",
        "travelType",
        "budget",
        "startDate",
        "endDate",
      ),
    )
    .all();

  return result;
};

const sendBuddyRequestIntoDB = async (tripId: string, userId: string) => {
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

const respondBuddyRequestIntoDB = async (
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

const getBuddyRequestsFromDB = async (userId: string, tripId: string) => {
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

export const BuddyRequestServices = {
  getBuddyRequestsFromDB,
  getBuddyRequestHistoryFromDB,
  sendBuddyRequestIntoDB,
  getRequestEligibilityFromDB,
  respondBuddyRequestIntoDB,
};
