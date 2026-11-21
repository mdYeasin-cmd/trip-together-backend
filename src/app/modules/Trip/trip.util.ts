import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { TRIP_FILTERABLE_FIELDS } from "./trip.constant";

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === "";

const parseNumber = (value: unknown, name: string): number | undefined => {
  if (isEmpty(value)) return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${name} must be a number`);
  }
  return n;
};

// Query-string values are always strings; convert them to the column's type.
const parseFilterValue = (key: string, value: unknown) => {
  switch (TRIP_FILTERABLE_FIELDS[key]) {
    case "number":
      return parseNumber(value, key);
    case "boolean":
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      // throw badRequest(`${key} must be true or false`);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `${key} must be true or false`,
      );
    default:
      return String(value);
  }
};

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export const TripUtils = {
  isEmpty,
  parseNumber,
  parseFilterValue,
  escapeLike,
};
