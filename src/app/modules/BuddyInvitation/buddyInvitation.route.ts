import express from "express";
import auth from "../../middlewares/auth";
import { BuddyInvitationControllers } from "./buddyInvitation.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { TravelBuddyValidators } from "./buddyInvitation.validator";

const router = express.Router();

router.get(
  "/eligibility/:tripId",
  auth(),
  BuddyInvitationControllers.getInvitationEligibility,
);

router.get("/history", auth(), BuddyInvitationControllers.getInvitationHistory);

router.post(
  "/:tripId",
  auth(),
  validatedRequest(TravelBuddyValidators.inviteTravelBuddyValidationSchema),
  BuddyInvitationControllers.inviteTravelBuddy,
);

router.get("/:tripId", auth(), BuddyInvitationControllers.getTripInvitations);

router.patch(
  "/:invitationId/respond",
  auth(),
  validatedRequest(
    TravelBuddyValidators.respondTravelBuddyInviteValidationSchema,
  ),
  BuddyInvitationControllers.respondTravelBuddyInvite,
);

export const BuddyInvitationRoutes = router;
