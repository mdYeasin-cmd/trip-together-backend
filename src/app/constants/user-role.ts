const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TRAVELER: "TRAVELER",
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

export { UserRole };
