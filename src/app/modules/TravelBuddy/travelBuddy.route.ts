import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./travelBuddy.validator";

const router = express.Router();

/* 
  =========== Invitations by trip creator ===========
*/

// travel buddy invite by trip creator
router.post(
  "/invitations/:tripId",
  auth(),
  validatedRequest(TravelBuddyValidators.inviteTravelBuddyValidationSchema),
  TravelBuddyControllers.inviteTravelBuddy,
);

// travel buddy invitaion respond by traveler
router.patch(
  "/invitations/:invitationId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyInviteValidationSchema,
  ),
  TravelBuddyControllers.respondTravelBuddyInvite,
);

// travel buddy invition get by trip creator
router.get(
  "/invitations/:tripId",
  auth(),
  validatedRequest(TravelBuddyValidators.inviteTravelBuddyValidationSchema),
  TravelBuddyControllers.inviteTravelBuddy,
);

export const TravelBuddyRoutes = router;
