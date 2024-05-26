import { Prisma, TravelBuddyRequestStatus, Trip } from "@prisma/client";
import prisma from "../../db/prisma";
import { ITripCreateData } from "./trip.interface";
import { paginationHelper } from "../../utils/paginationHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
};

const createATripIntoDB = async (
  userId: string,
  data: ITripCreateData
): Promise<Trip> => {
  data.userId = userId;

  data.startDate = new Date(data.startDate);
  data.endDate = new Date(data.endDate);

  const result = await prisma.trip.create({
    data,
  });

  return result;
};

const getAllTripsFromDB = async (params: any, options: IPaginationOptions) => {
  const { searchTerm, minBudget, maxBudget, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andConditions: Prisma.TripWhereInput[] = [];

  if (params.minBudget) {
    filterData.budget = {
      gte: Number(minBudget),
    };
  }

  if (params.maxBudget) {
    filterData.budget = {
      lte: Number(maxBudget),
    };
  }

  if (params.minBudget && params.maxBudget) {
    filterData.budget = {
      gte: Number(minBudget),
      lte: Number(maxBudget),
    };
  }

  if (params.searchTerm) {
    andConditions.push({
      OR: ["destination"].map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (key === "budget") {
          return {
            [key]: filterData[key],
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditons: Prisma.TripWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  whereConditons.isDeleted = false;

  const result = await prisma.trip.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.trip.count({
    where: whereConditons,
  });

  return {
    meta: {
      limit,
      page,
      total,
    },
    data: result,
  };
};

const sendTravelBuddyRequestIntoDB = async (
  tripId: string,
  data: {
    userId: string;
  }
) => {
  await prisma.trip.findUniqueOrThrow({
    where: {
      id: tripId,
    },
  });

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

const deleteATripFromDB = async (userId: string, tripId: string) => {
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
      userId: userId,
    },
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  const result = await prisma.trip.update({
    where: {
      id: tripId,
      userId,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const TripServices = {
  createATripIntoDB,
  getAllTripsFromDB,
  sendTravelBuddyRequestIntoDB,
  deleteATripFromDB,
};
