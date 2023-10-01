import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { Request, Response } from "express";
import orderController from "../controllers/order.controller";
import { catchAsync } from "catch-async-express";
import { checkRole } from "../middleware/checkRole";
import { UserRights } from "../utils";

const router = Router();

const prisma = new PrismaClient();

router.post(
    "/",
    isAuthenticated(),
    //   checkRole([UserRights.PLACE_ORDER]),
    catchAsync(orderController.createOrder)
);

router.put(
    "/:id",
    isAuthenticated(),
    //   checkRole([UserRights.UPDATE_ORDER]),
    catchAsync(orderController.updateOrder)
);

router.post(
    "/cancel",
    isAuthenticated(),
    //   checkRole([UserRights.CANCEL_ORDER]),
    catchAsync(orderController.cancelOrder)
);

export default router;
