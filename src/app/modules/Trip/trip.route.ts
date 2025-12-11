import express from "express";
import auth from "../../middlewares/auth";
import { TripControllers } from "./trip.controller";
import { TripValidators } from "./trip.validator";
import validatedRequest from "../../middlewares/validatedRequest";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TRAVELER),
  validatedRequest(TripValidators.createATripValidationSchema),
  TripControllers.createATrip
);

router.get("/", TripControllers.getAllTrips);

router.delete(
  "/:tripId",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  TripControllers.deleteATrip
);

export const TripRoutes = router;
