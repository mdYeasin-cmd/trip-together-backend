import z from "zod";

const registerProfileSchema = z.object({
  bio: z.string(),
  age: z.number(),
});

const registerUserValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    profile: registerProfileSchema,
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const UserValidators = {
  registerUserValidationSchema,
  loginValidationSchema,
  updateUserValidationSchema,
};
