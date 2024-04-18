import { TravelBuddyRequestStatus } from "@prisma/client";
import prisma from "../../db/prisma";

const getTravelBuddiesByTripIdFromDB = async (tripId: string) => {
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

const respondTravelBuddyRequestIntoDB = async (
  buddyId: string,
  data: {
    tripId: string;
    status: TravelBuddyRequestStatus;
  }
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

export const TravelBuddyServices = {
  getTravelBuddiesByTripIdFromDB,
  respondTravelBuddyRequestIntoDB,
};
