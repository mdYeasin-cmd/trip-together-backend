import z from "zod";

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

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(6),
  }),
});

export const AuthValidators = {
  loginValidationSchema,
  updateUserValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
