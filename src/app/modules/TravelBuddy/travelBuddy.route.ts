import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./travelBuddy.validator";

const router = express.Router();

router.get(
  "/travel-buddies/:tripId",
  auth(),
  TravelBuddyControllers.getTravelBuddiesByTripId
);

router.put(
  "/travel-buddies/:buddyId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyRequestValidationSchema
  ),
  TravelBuddyControllers.respondTravelBuddyRequest
);

export const TravelBuddyRoutes = router;
