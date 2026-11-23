const TravelBuddyRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

type TravelBuddyRequestStatus =
  (typeof TravelBuddyRequestStatus)[keyof typeof TravelBuddyRequestStatus];

const TravelBuddyRequestType = {
  REQUEST: "REQUEST",
  INVITE: "INVITE",
} as const;

type TravelBuddyRequestType =
  (typeof TravelBuddyRequestType)[keyof typeof TravelBuddyRequestType];

export { TravelBuddyRequestStatus, TravelBuddyRequestType };
