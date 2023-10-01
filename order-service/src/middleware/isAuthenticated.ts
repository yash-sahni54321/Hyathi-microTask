import { RequestHandler } from "express";
import { adminUserRights, normalUserRights } from "../utils";
import { ApiErrorHandler } from "../../../shared/utils";
import jwt from "jsonwebtoken";
import { UserRequest } from "../types";

import { userRoles } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: UserRequest;
    }
  }
}

export const isAuthenticated = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      const authorizationHeader = req.headers.authorization
        ?.replace("Bearer", "")
        .trim();
      console.log(authorizationHeader);
      if (!authorizationHeader) {
        throw new ApiErrorHandler({
          code: 401,
          message: "User not Verified!",
        });
      }
      const { id } = jwt.verify(
        authorizationHeader,
        process.env.JWT_SECRET_KEY!
      ) as any;

      console.log(id);
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new ApiErrorHandler({
          code: 401,
          message: "Unauthorized",
        });
      }

      let userRole;
      switch (user.roleId) {
        case 1: {
          userRole = userRoles.ADMIN;
          break;
        }
        case 2: {
          userRole = userRoles.normalUser;
          break;
        }
      }
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleId === 1 ? userRoles.ADMIN : userRoles.normalUser,
        rights:
          userRole === userRoles.ADMIN ? adminUserRights : normalUserRights,
      };
      return next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        code: 401,
        message: "Unauthorized",
      });
    }
  };
};
