import z from "zod";

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const UserValidators = {
  updateUserValidationSchema,
};
