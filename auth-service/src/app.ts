import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.routes";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/auth", authRoutes);

export default app;
