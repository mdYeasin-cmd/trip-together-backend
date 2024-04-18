import z from "zod";

const createATripValidationSchema = z.object({
  body: z.object({
    destination: z.string({
      required_error: "Destination is required",
    }),
    startDate: z.string({
      required_error: "Start date is required",
    }),
    endDate: z.string({
      required_error: "End date is required",
    }),
    budget: z.number({
      required_error: "Budget is required",
    }),
    activities: z
      .array(
        z.string({
          invalid_type_error: "Activitiy name must be a string",
        })
      )
      .nonempty({
        message: "At least one activity is required",
      }),
  }),
});

const sendTravelBuddyRequestValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
  }),
});

export const TripValidators = {
  createATripValidationSchema,
  sendTravelBuddyRequestValidationSchema,
};
