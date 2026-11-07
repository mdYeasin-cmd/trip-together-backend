import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { UserRoutes } from "../modules/User/user.route";
import { TripRoutes } from "../modules/Trip/trip.route";
import { BuddyInvitationRoutes } from "../modules/BuddyInvitation/buddyInvitation.route";
import { BuddyRequestRoutes } from "../modules/BuddyRequest/buddyRequest.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/trips",
    route: TripRoutes,
  },
  {
    path: "/travel-buddy-requests",
    route: BuddyRequestRoutes,
  },
  {
    path: "/travel-buddy-invitations",
    route: BuddyInvitationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
