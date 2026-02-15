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

const sendTravelBuddyRequestValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
  }),
});

const requestEligibilityValidationSchema = z.object({
  params: z.object({
    tripId: z.string(),
    buddyId: z.string(),
  }),
});

export const TravelBuddyValidators = {
  respondTravelBuddyRequestValidationSchema,
  sendTravelBuddyRequestValidationSchema,
  requestEligibilityValidationSchema,
};
