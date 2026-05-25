import httpStatus from "http-status";
import prisma from "../../db/prisma";
import ApiError from "../../errors/ApiError";
import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "@prisma/client";

const getTravelRequestHistroyFromDB = async (userId: string) => {
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

export const BuddyRequestServices = {
  getTravelRequestHistroyFromDB,
  sendBuddyRequestIntoDB,
};
