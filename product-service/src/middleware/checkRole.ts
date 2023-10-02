import { NextFunction, Request, RequestHandler, Response } from "express";
import { UserRights } from "../utils";
import { ApiErrorHandler } from "../../../shared/utils";

export const checkRole = (requiredRights: UserRights[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    if (!user) {
      throw new ApiErrorHandler({ message: "User not found", code: 404 });
    }

    if (requiredRights.length) {
      const allRequiredRights = requiredRights.every((requiredRight) =>
        user.rights?.includes(requiredRight)
      );

      if (!allRequiredRights) {
        return res.status(401).json({
          code: 403,
          message: "Unauthorized Access!",
        });
      }
    }
    next();
  };
};
