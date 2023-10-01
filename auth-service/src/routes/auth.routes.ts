import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { User } from "../types";
import { Request, Response } from "express";
import authController from "../controllers/auth.controller";
import { catchAsync } from "catch-async-express";

const router = Router();

const prisma = new PrismaClient();

console.log("yash");

router.post("/login", catchAsync(authController.login));

router.post("/register", catchAsync(authController.register));

router.post("/logout", catchAsync(authController.logout));

export default router;
