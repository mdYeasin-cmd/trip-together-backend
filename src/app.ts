import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { UserRoutes } from "./app/modules/User/user.route";
import { TripRoutes } from "./app/modules/Trip/trip.route";
import { TravelBuddyRoutes } from "./app/modules/TravelBuddy/travelBuddy.route";
import cors from "cors";

// application configurations
const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// routes
app.use("/api", UserRoutes);
app.use("/api", TripRoutes);
app.use("/api", TravelBuddyRoutes);

// test route
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Travel Buddy Finder server is running...",
  });
});

// global error handler
app.use(globalErrorHandler);

// not found route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
