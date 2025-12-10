import express from "express";
import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth";
import validatedRequest from "../../middlewares/validatedRequest";
import { AuthValidators } from "./auth.validator";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/register-traveller",
  validatedRequest(AuthValidators.registerTravellerValidationSchema),
  AuthControllers.registerTraveller
);

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN),
  validatedRequest(AuthValidators.createAdminValidationSchema),
  AuthControllers.createAdmin
);

router.post(
  "/login",
  validatedRequest(AuthValidators.loginValidationSchema),
  AuthControllers.loginUser
);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  AuthControllers.changePassword
);

export const AuthRoutes = router;
