import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/register", UserControllers.registerUser);

router.post("/login", UserControllers.loginUser);

router.get("/profile", auth(), UserControllers.getMyProfile);

export const UserRoutes = router;
