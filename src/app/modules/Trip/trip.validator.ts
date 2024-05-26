import z from "zod";

const createATripValidationSchema = z.object({
  body: z.object({
    photos: z
      .array(
        z.string({
          invalid_type_error: "Url must be a string.",
        })
      )
      .nonempty({
        message: "At least one photo is required",
      }),
    destination: z.string({
      required_error: "Destination is required.",
      invalid_type_error: "Destination must be a string.",
    }),
    travelType: z.string({
      required_error: "Travel type is required.",
      invalid_type_error: "Travel type must be a string.",
    }),
    budget: z.number({
      required_error: "Budget is required",
      invalid_type_error: "Budget must be a number.",
    }),
    startDate: z.string({
      required_error: "Start date is required",
    }),
    endDate: z.string({
      required_error: "End date is required",
    }),
    description: z.string({
      required_error: "Description is required.",
      invalid_type_error: "Description must be a string.",
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
