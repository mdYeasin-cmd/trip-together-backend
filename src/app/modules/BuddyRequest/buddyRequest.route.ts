import express from "express";
import auth from "../../middlewares/auth";
import { BuddyRequestControllers } from "./buddyRequest.controller";
import validatedRequest from "../../middlewares/validatedRequest";
import { BuddyRequestValidators } from "./buddyRequest.validator";

const router = express.Router();

router.get(
  "/eligibility/:tripId",
  auth(),
  validatedRequest(BuddyRequestValidators.requestEligibilityValidationSchema),
  BuddyRequestControllers.getRequestEligibility,
);

router.post("/:tripId", auth(), BuddyRequestControllers.sendBuddyRequest);

router.get("/history", auth(), BuddyRequestControllers.getBuddyRequestHistory);

router.get("/:tripId", auth(), BuddyRequestControllers.getBuddyRequests);

router.patch(
  "/:requestId/respond",
  auth(),
  validatedRequest(BuddyRequestValidators.respondBuddyRequestValidationSchema),
  BuddyRequestControllers.respondBuddyRequest,
);

export const BuddyRequestRoutes = router;
