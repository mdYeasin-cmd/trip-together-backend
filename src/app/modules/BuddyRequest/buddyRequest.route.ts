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
router.get(
  "/requests/history",
  auth(),
  BuddyRequestControllers.getTravelRequestHistroy,
);

// request eligibility check for a traveler
// router.get(
//   "/requests/eligibility/:tripId",
//   auth(),
//   validatedRequest(TravelBuddyValidators.requestEligibilityValidationSchema),
//   TravelBuddyControllers.getRequestEligibility,
// );

// travel buddy request from traveler
router.post(
  "/requests/:tripId",
  auth(),
  validatedRequest(BuddyRequestValidators.sendBuddyRequestValidationSchema),
  BuddyRequestControllers.sendBuddyRequest,
);

// travel buddy respond by trip creator
// router.patch(
//   "/requests/:buddyId/respond",
//   auth(),
//   validatedRequest(
//     TravelBuddyValidators.respondTravelBuddyRequestValidationSchema,
//   ),
//   TravelBuddyControllers.respondTravelBuddyRequest,
// );

// travel buddy request get by trip creator
// router.get(
//   "/requests/:tripId",
//   auth(),
//   TravelBuddyControllers.getTravelBuddyRequests,
// );

export const BuddyRequestRoutes = router;
