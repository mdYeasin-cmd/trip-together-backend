import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";
import { orm } from "../../../prisma/db";
import { ITrip, ITripCreateData, TripCondition } from "./trip.interface";
import { paginationHelper } from "../../utils/paginationHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { TripUtils } from "./trip.util";
import {
  DEFAULT_SORT_FIELD,
  TRIP_FILTERABLE_FIELDS,
  TRIP_SEARCHABLE_FIELDS,
  TRIP_SORTABLE_FIELDS,
} from "./trip.constant";

type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
};

const createATripIntoDB = async (
  userId: string,
  data: ITripCreateData,
): Promise<ITrip> => {
  data.userId = userId;

  data.startDate = new Date(data.startDate);
  data.endDate = new Date(data.endDate);

  const result = await orm.Trip.create(data);

  return result;
};

const getAllTripsFromDB = async (params: any, options: IPaginationOptions) => {
  const { searchTerm, minBudget, maxBudget, ...restFields } = params;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // Validate minBudget and maxBudget values
  const min = TripUtils.parseNumber(minBudget, "minBudget");
  const max = TripUtils.parseNumber(maxBudget, "maxBudget");
  if (min !== undefined && max !== undefined && min > max) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "minBudget cannot be greater than maxBudget",
    );
  }

  // Filter data which is send by user in query params
  const filterData = Object.entries(restFields)
    .filter(
      ([key, value]) =>
        Object.prototype.hasOwnProperty.call(TRIP_FILTERABLE_FIELDS, key) &&
        !TripUtils.isEmpty(value),
    )
    .map(
      ([key, value]) => [key, TripUtils.parseFilterValue(key, value)] as const,
    );

  // Build conditions
  const conditions: TripCondition[] = [(trip) => trip.isDeleted.eq(false)];

  const term = typeof searchTerm === "string" ? searchTerm.trim() : "";
  if (term) {
    const pattern = `%${TripUtils.escapeLike(term)}%`;
    conditions.push((trip) =>
      or(...TRIP_SEARCHABLE_FIELDS.map((field) => trip[field].ilike(pattern))),
    );
  }

  if (min !== undefined) conditions.push((trip) => trip.budget.gte(min));
  if (max !== undefined) conditions.push((trip) => trip.budget.lte(max));

  for (const [key, value] of filterData) {
    conditions.push((trip) => trip[key].eq(value));
  }

  const whereConditions = (trip: any) =>
    conditions.length > 0 ? and(...conditions.map((c) => c(trip))) : all();

  const orderField =
    typeof sortBy === "string" && TRIP_SORTABLE_FIELDS.includes(sortBy)
      ? sortBy
      : DEFAULT_SORT_FIELD;
  const direction = sortOrder === "asc" ? "asc" : "desc";

  const [data, countResult] = await Promise.all([
    orm.Trip.where(whereConditions)
      .orderBy((trip: any) => trip[orderField][direction]())
      .limit(limit)
      .offset(skip)
      .all(),
    orm.Trip.where(whereConditions).aggregate((a: any) => ({
      total: a.count(),
    })),
  ]);

  const total = Number(countResult.total);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getATripFromDB = async (tripId: string) => {
  const tripFields = [
    "id",
    "userId",
    "photos",
    "destination",
    "travelType",
    "budget",
    "startDate",
    "endDate",
    "description",
    "createdAt",
    "updatedAt",
  ] as const;

  const trip = await orm.Trip.select(...tripFields)
    .where((trip) => trip.isDeleted.eq(false))
    .first({ id: tripId });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  return trip;
};

const updateATripIntoDB = async (
  userId: string,
  tripId: string,
  data: Partial<ITripCreateData>,
) => {
  const trip = await orm.Trip.where((trip) => trip.isDeleted.eq(false)).first({
    id: tripId,
    userId: userId,
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  const result = await orm.Trip.where({ id: tripId }).update(data);

  return result;
};

const deleteATripFromDB = async (userId: string, tripId: string) => {
  const trip = await orm.Trip.where((trip) => trip.isDeleted.eq(false)).first({
    id: tripId,
    userId: userId,
  });

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "This trip is not found!");
  }

  const result = await orm.Trip.where({ id: tripId, userId }).update({
    isDeleted: true,
  });

  return result;
};

export const TripServices = {
  createATripIntoDB,
  getAllTripsFromDB,
  getATripFromDB,
  updateATripIntoDB,
  deleteATripFromDB,
};
