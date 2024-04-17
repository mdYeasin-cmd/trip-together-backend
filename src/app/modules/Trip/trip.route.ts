import express from "express";
import auth from "../../middlewares/auth";
import { TripControllers } from "./trip.controller";

const router = express.Router();

router.post("/trips", auth(), TripControllers.createATrip);

router.get("/trips", TripControllers.getAllTrips);

router.post("/trip/:tripId/request", TripControllers.sendTravelBuddyRequest);

export const TripRoutes = router;
