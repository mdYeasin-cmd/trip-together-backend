import { TravelBuddyRequestStatus } from "@prisma/client";
import { z } from "zod";

const respondTravelBuddyRequestValidationSchema = z.object({
  body: z.object({
    tripId: z.string(),
    status: z.enum([
      TravelBuddyRequestStatus.APPROVED,
      TravelBuddyRequestStatus.REJECTED,
    ]),
  }),
});

const sendBuddyRequestValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
  }),
});

const requestEligibilityValidationSchema = z.object({
  params: z.object({
    tripId: z.string(),
  }),
});

export const BuddyRequestValidators = {
  respondTravelBuddyRequestValidationSchema,
  sendBuddyRequestValidationSchema,
  requestEligibilityValidationSchema,
};
