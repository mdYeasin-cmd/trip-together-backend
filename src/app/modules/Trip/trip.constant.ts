export const TRIP_SEARCHABLE_FIELDS = ["destination"] as const;

export const TRIP_FILTERABLE_FIELDS: Record<
  string,
  "string" | "number" | "boolean"
> = {
  status: "string",
  destination: "string",
  travelType: "string",
};

export const TRIP_SORTABLE_FIELDS: readonly string[] = [
  "createdAt",
  "startDate",
  "budget",
  "destination",
];

export const DEFAULT_SORT_FIELD = "createdAt";
