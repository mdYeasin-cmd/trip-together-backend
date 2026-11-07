import express from "express";
import auth from "../../middlewares/auth";
import { BuddyRequestControllers } from "./buddyRequest.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { BuddyRequestValidators } from "./buddyRequest.validator";

const router = express.Router();

/* 
  =========== Requests by traveler ===========
*/

// request history of a traveler
router.get("/history", auth(), BuddyRequestControllers.getBuddyRequestHistory);

// request eligibility check for a traveler
router.get(
  "/eligibility/:tripId",
  auth(),
  validatedRequest(BuddyRequestValidators.requestEligibilityValidationSchema),
  BuddyRequestControllers.getRequestEligibility,
);

// travel buddy request from traveler
router.post("/trips/:tripId", auth(), BuddyRequestControllers.sendBuddyRequest);

// travel buddy respond by trip creator
router.patch(
  "/:requestId/respond",
  auth(),
  validatedRequest(BuddyRequestValidators.respondBuddyRequestValidationSchema),
  BuddyRequestControllers.respondBuddyRequest,
);

// travel buddy request get by trip creator
router.get("/trips/:tripId", auth(), BuddyRequestControllers.getBuddyRequests);

export const BuddyRequestRoutes = router;
