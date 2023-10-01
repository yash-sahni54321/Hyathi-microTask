import dotenv from "dotenv";
dotenv.config();
import orderRoutes from "./routes/order.routes";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/order", orderRoutes);

app.listen(process.env.PORT, () => console.log("Started server on port", process.env.PORT));
