const UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED",
} as const;

type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export { UserStatus };
