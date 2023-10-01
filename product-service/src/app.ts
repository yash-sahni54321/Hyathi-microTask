import dotenv from "dotenv";
dotenv.config();
import productRoutes from "./routes/product.routes";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/products", productRoutes);

export default app;
