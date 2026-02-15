import { TravelBuddyRequestStatus } from "@prisma/client";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getTravelBuddiesByTripIdFromDB = async (
  userId: string,
  tripId: string,
) => {
  // only trip owner can see travel buddies requests associated with trip
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
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

  const result = await prisma.travelBuddyRequest.findMany({
    where: {
      tripId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const sendTravelBuddyRequestIntoDB = async (tripId: string, userId: string) => {
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
      status: TravelBuddyRequestStatus.PENDING,
    },
  });

  return result;
};

const respondTravelBuddyRequestIntoDB = async (
  buddyId: string,
  data: {
    tripId: string;
    status: TravelBuddyRequestStatus;
  },
) => {
  const buddyRequest = await prisma.travelBuddyRequest.findFirstOrThrow({
    where: {
      userId: buddyId,
      tripId: data.tripId,
    },
  });

  const result = await prisma.travelBuddyRequest.update({
    where: {
      id: buddyRequest.id,
    },
    data: {
      status: data.status,
    },
  });

  return result;
};

const getRequestEligibilityFromDB = async (tripId: string, userId: string) => {
  const [trip, user] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);

  if (!trip) {
    throw new ApiError(404, "Trip is not found.");
  }

  if (!user) {
    throw new ApiError(404, "User is not found.");
  }

  const existingRequest = await prisma.travelBuddyRequest.findFirst({
    where: {
      tripId: tripId,
      userId: userId,
    },
    select: {
      id: true,
      tripId: true,
      userId: true,
      status: true,
    },
  });

  return existingRequest;
};

export const TravelBuddyServices = {
  getTravelBuddiesByTripIdFromDB,
  sendTravelBuddyRequestIntoDB,
  respondTravelBuddyRequestIntoDB,
  getRequestEligibilityFromDB,
};
