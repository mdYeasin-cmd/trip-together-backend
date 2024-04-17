import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import validatedRequest from "../../middlewares/validatedRequest";
import { UserValidators } from "./user.validator";

const router = express.Router();

router.post(
  "/register",
  validatedRequest(UserValidators.registerUserValidationSchema),
  UserControllers.registerUser
);

router.post(
  "/login",
  validatedRequest(UserValidators.loginValidationSchema),
  UserControllers.loginUser
);

router.get("/profile", auth(), UserControllers.getMyProfile);

router.put(
  "/profile",
  auth(),
  validatedRequest(UserValidators.updateUserValidationSchema),
  UserControllers.updateMyProfile
);

export const UserRoutes = router;
