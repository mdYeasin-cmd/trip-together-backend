import express from "express";
import auth from "../../middlewares/auth";
import { TripControllers } from "./trip.controller";

const router = express.Router();

router.post("/trips", auth(), TripControllers.createATrip);

export const TripRoutes = router;
