import { Trip } from "@prisma/client";
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

export const TripServices = {
  createATripIntoDB,
};
