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
  await prisma.travelBuddyRequest.findUniqueOrThrow({
    where: {
      id: buddyId,
    },
  });

  const result = await prisma.travelBuddyRequest.update({
    where: {
      id: buddyId,
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
