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

const updateProfileValidationSchema = z
  .object({
    bio: z.string().optional(),
    age: z.number().optional(),
  })
  .strict();

const updateUserValidationSchema = z
  .object({
    body: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      profile: updateProfileValidationSchema,
    }),
  })
  .strict();

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
