import {
  TravelBuddyRequestStatus,
  TravelBuddyRequestType,
} from "@prisma/client";
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
      type: TravelBuddyRequestType.REQUEST,
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

const getTravelBuddyRequestsFromDB = async (userId: string, tripId: string) => {
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
    },
    select: {
      id: true,
      status: true,
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

const inviteTravelBuddyIntoDB = async (
  userId: string,
  tripId: string,
  buddyId: string,
) => {
  if (userId === buddyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot invite yourself.");
  }

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
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Trip not found or you are not authorized.",
    );
  }

  const buddy = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!buddy) {
    throw new ApiError(httpStatus.NOT_FOUND, "Traveler not found.");
  }

  const existingRequest = await prisma.travelBuddyRequest.findFirst({
    where: {
      tripId,
      userId: buddyId,
    },
    select: {
      id: true,
    },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This traveler already has a request or invite for this trip.",
    );
  }

  const result = await prisma.travelBuddyRequest.create({
    data: {
      tripId,
      userId: buddyId,
      invitedById: userId,
      type: TravelBuddyRequestType.INVITE,
      status: TravelBuddyRequestStatus.PENDING,
    },
    select: {
      id: true,
      tripId: true,
      userId: true,
      invitedById: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  return result;
};

const respondTravelBuddyInviteIntoDB = async (
  tripId: string,
  invitationId: string,
  userId: string,
  status: TravelBuddyRequestStatus,
) => {
  const result = await prisma.travelBuddyRequest.updateMany({
    where: {
      id: invitationId,
      userId,
      tripId,
      type: TravelBuddyRequestType.INVITE,
      status: TravelBuddyRequestStatus.PENDING,
      isDeleted: false,
    },
    data: {
      status: status,
    },
  });

  if (result?.count === 0) {
    const invitation = await prisma.travelBuddyRequest.findUnique({
      where: {
        id: invitationId,
      },
      select: {
        id: true,
        status: true,
        isDeleted: true,
        userId: true,
        tripId: true,
      },
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

export const TravelBuddyServices = {
  getTravelBuddiesByTripIdFromDB,
  sendTravelBuddyRequestIntoDB,
  respondTravelBuddyRequestIntoDB,
  getRequestEligibilityFromDB,
  getTravelRequestHistroyFromDB,
  getTravelBuddyRequestsFromDB,
  inviteTravelBuddyIntoDB,
  respondTravelBuddyInviteIntoDB,
};
