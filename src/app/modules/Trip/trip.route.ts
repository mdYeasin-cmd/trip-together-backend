import express from "express";
import auth from "../../middlewares/auth";
import { TripControllers } from "./trip.controller";
import { TripValidators } from "./trip.validator";
import validatedRequest from "../../middlewares/validatedRequest";

const router = express.Router();

router.post(
  "/trips",
  auth(),
  validatedRequest(TripValidators.createATripValidationSchema),
  TripControllers.createATrip
);

router.get("/trips", TripControllers.getAllTrips);

router.post(
  "/trip/:tripId/request",
  auth(),
  validatedRequest(TripValidators.sendTravelBuddyRequestValidationSchema),
  TripControllers.sendTravelBuddyRequest
);

export const TripRoutes = router;
