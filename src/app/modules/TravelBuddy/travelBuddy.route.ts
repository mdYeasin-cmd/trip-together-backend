import express from "express";
import auth from "../../middlewares/auth";
import { TravelBuddyControllers } from "./travelBuddy.controller";

const router = express.Router();

router.get(
  "/travel-buddies/:tripId",
  auth(),
  TravelBuddyControllers.getTravelBuddiesByTripId
);

export const TravelBuddyRoutes = router;
