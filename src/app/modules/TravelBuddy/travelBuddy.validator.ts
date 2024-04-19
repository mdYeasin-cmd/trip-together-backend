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

export const TravelBuddyValidators = {
  respondTravelBuddyRequestValidationSchema,
};
