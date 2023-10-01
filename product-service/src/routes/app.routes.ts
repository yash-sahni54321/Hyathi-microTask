import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const router = Router();

const prisma = new PrismaClient();
