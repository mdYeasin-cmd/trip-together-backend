import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";
import prisma from "../db/prisma";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt_secret as Secret
      );

      const user = await prisma.user.findUnique({
        where: {
          id: verifiedUser.id,
        },
      });

      if (!user) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Your user account is not found!"
        );
      }

      req.user = verifiedUser;

      return next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
