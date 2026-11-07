import express from "express";
import auth from "../../middlewares/auth";
import { BuddyInvitationControllers } from "./buddyInvitation.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./buddyInvitation.validator";

const router = express.Router();

/* 
  =========== Invitations by trip creator ===========
*/

// travel buddy invite by trip creator
router.post(
  "/trips/:tripId",
  auth(),
  validatedRequest(TravelBuddyValidators.inviteTravelBuddyValidationSchema),
  BuddyInvitationControllers.inviteTravelBuddy,
);

// travel buddy invitaion respond by traveler
router.patch(
  "/invitations/:invitationId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyInviteValidationSchema,
  ),
  BuddyInvitationControllers.respondTravelBuddyInvite,
);

// travel buddy invition get by trip creator
// router.get(
//   "/invitations/:tripId",
//   auth(),
//   validatedRequest(TravelBuddyValidators.inviteTravelBuddyValidationSchema),
//   BuddyInvitationControllers.inviteTravelBuddy,
// );

export const BuddyInvitationRoutes = router;
