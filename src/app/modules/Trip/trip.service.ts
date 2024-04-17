import { TravelBuddyRequestStatus, Trip } from "@prisma/client";
import prisma from "../../db/prisma";
import { ITripCreateData } from "./trip.interface";

const createATripIntoDB = async (
  userId: string,
  data: ITripCreateData
): Promise<Trip> => {
  data.userId = userId;

  const result = await prisma.trip.create({
    data,
  });

  return result;
};

const getAllTripsFromDB = async () => {
  const result = await prisma.trip.findMany();

  return result;
};

const sendTravelBuddyRequestIntoDB = async (
  tripId: string,
  data: {
    userId: string;
  }
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: data.userId,
    },
  });

  const result = await prisma.travelBuddyRequest.create({
    data: {
      tripId,
      userId: data.userId,
      status: TravelBuddyRequestStatus.PENDING,
    },
  });

  return result;
};

export const TripServices = {
  createATripIntoDB,
  getAllTripsFromDB,
  sendTravelBuddyRequestIntoDB,
};
