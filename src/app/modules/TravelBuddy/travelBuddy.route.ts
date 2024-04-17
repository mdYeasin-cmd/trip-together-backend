import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";

const router = express.Router();

router.get(
  "/travel-buddies/:tripId",
  auth(),
  TravelBuddyControllers.getTravelBuddiesByTripId
);

router.put(
  "/travel-buddies/:buddyId/respond",
  auth(),
  TravelBuddyControllers.respondTravelBuddyRequest
);

export const TravelBuddyRoutes = router;
