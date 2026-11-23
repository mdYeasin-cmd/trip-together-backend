import express from "express";
import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth";
import validatedRequest from "../../middlewares/validatedRequest";
import { AuthValidators } from "./auth.validator";
import { UserRole } from "../../constants/user-role";

const router = express.Router();

router.post(
  "/login",
  validatedRequest(AuthValidators.loginValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  AuthControllers.changePassword,
);

router.post(
  "/forgot-password",
  validatedRequest(AuthValidators.forgotPasswordValidationSchema),
  AuthControllers.forgotPassword,
);

router.post(
  "/reset-password",
  validatedRequest(AuthValidators.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
