import z from "zod";

const registerTravellerValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  }),
});

const createAdminValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const UserValidators = {
  registerTravellerValidationSchema,
  createAdminValidationSchema,
  updateUserValidationSchema,
};
