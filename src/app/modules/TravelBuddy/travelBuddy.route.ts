import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./travelBuddy.validator";
import { UserRole } from "@prisma/client";

const router = express.Router();

// get all travel buddies requests
router.get("/:tripId", auth(), TravelBuddyControllers.getTravelBuddiesByTripId);

// travel buddy request
router.post(
  "/:tripId/request",
  auth(),
  validatedRequest(
    TravelBuddyValidators.sendTravelBuddyRequestValidationSchema
  ),
  TravelBuddyControllers.sendTravelBuddyRequest
);

// travel buddy respond
router.put(
  "/:buddyId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyRequestValidationSchema
  ),
  TravelBuddyControllers.respondTravelBuddyRequest
);

export const TravelBuddyRoutes = router;
