import httpStatus from "http-status";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "@prisma/client";

const getBuddyRequestHistoryFromDB = async (userId: string) => {
  const result = await prisma.travelBuddyRequest.findMany({
    where: {
      userId: userId,
    },
    include: {
      trip: {
        select: {
          id: true,
          destination: true,
          travelType: true,
          budget: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return result;
};

const sendBuddyRequestIntoDB = async (tripId: string, userId: string) => {
  const [trip, user, existingRequest] = await Promise.all([
    prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      select: {
        id: true,
        userId: true,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    }),
    prisma.travelBuddyRequest.findFirst({
      where: {
        tripId: tripId,
        userId: userId,
      },
      select: {
        id: true,
      },
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

  const result = await prisma.travelBuddyRequest.create({
    data: {
      tripId,
      userId: userId,
      type: TravelBuddyRequestType.REQUEST,
      status: TravelBuddyRequestStatus.PENDING,
    },
  });

  return result;
};

const getRequestEligibilityFromDB = async (tripId: string, userId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, userId: true },
  });

  if (!trip) {
    throw new ApiError(404, "Trip is not found.");
  }

  if (trip.userId === userId) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Owner cannot request to join own trip.",
    );
  }

  const existingRequest = await prisma.travelBuddyRequest.findFirst({
    where: {
      tripId: tripId,
      userId: userId,
    },
    select: {
      status: true,
    },
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
  const tripRequest = await prisma.travelBuddyRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      tripId: true,
      userId: true,
      status: true,
      trip: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!tripRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel buddy request not found.");
  }

  if (tripRequest.trip.userId !== userId) {
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

  const result = await prisma.travelBuddyRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: data.status,
    },
  });

  return result;
};

const getBuddyRequestsFromDB = async (userId: string, tripId: string) => {
  // userId = trip creator userId
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "Trip not found.");
  }

  const travelBuddyRequests = await prisma.travelBuddyRequest.findMany({
    where: {
      tripId: tripId,
      type: TravelBuddyRequestType.REQUEST,
    },
    select: {
      id: true,
      userId: true,
      tripId: true,
      status: true,
      type: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return travelBuddyRequests;
};

export const BuddyRequestServices = {
  getBuddyRequestsFromDB,
  getBuddyRequestHistoryFromDB,
  sendBuddyRequestIntoDB,
  getRequestEligibilityFromDB,
  respondBuddyRequestIntoDB,
};
