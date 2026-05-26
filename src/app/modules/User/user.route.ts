import express from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./user.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { UserValidators } from "./user.validator";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/register-traveller",
  validatedRequest(UserValidators.registerTravellerValidationSchema),
  UserControllers.registerTraveller,
);

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN),
  validatedRequest(UserValidators.createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  UserControllers.getAllUsers,
);

router.get("/profile", auth(), UserControllers.getMyProfile);

router.put(
  "/profile",
  auth(),
  validatedRequest(UserValidators.updateUserValidationSchema),
  UserControllers.updateMyProfile,
);

router.patch(
  "/change-status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.chnageUserStatus,
);

router.get("/:userId", UserControllers.getAUser);

export const UserRoutes = router;
