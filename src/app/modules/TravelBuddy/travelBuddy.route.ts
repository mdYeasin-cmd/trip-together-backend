import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./travelBuddy.validator";

const router = express.Router();

// request history of a traveler
router.get(
  "/request-history",
  auth(),
  TravelBuddyControllers.getTravelRequestHistroy,
);

router.get(
  "/request-eligibility/:tripId",
  auth(),
  validatedRequest(TravelBuddyValidators.requestEligibilityValidationSchema),
  TravelBuddyControllers.getRequestEligibility,
);

// travel buddy request
router.post(
  "/:tripId/request",
  auth(),
  validatedRequest(
    TravelBuddyValidators.sendTravelBuddyRequestValidationSchema,
  ),
  TravelBuddyControllers.sendTravelBuddyRequest,
);

// travel buddy respond
router.put(
  "/:buddyId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyRequestValidationSchema,
  ),
  TravelBuddyControllers.respondTravelBuddyRequest,
);

// get all travel buddies requests
router.get("/:tripId", auth(), TravelBuddyControllers.getTravelBuddiesByTripId);

export const TravelBuddyRoutes = router;
