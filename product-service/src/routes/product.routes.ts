import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import productController from "../controllers/product.controller";
import { catchAsync } from "catch-async-express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { checkRole } from "../middleware/checkRole";
import { UserRights } from "../utils";

const router = express.Router();

router.post(
  "/",
  isAuthenticated(),
  checkRole([UserRights.CREATE_PRODUCT]),
  catchAsync(productController.createProduct)
);

// Get All Products
router.get(
  "/",
  isAuthenticated(),
  catchAsync(productController.getAllProducts)
);

// Get Product Details
router.get(
  "/:id",
  isAuthenticated(),
  catchAsync(productController.getProductDetails)
);

// Update Product
router.put(
  "/:id",
  isAuthenticated(),
  checkRole([UserRights.UPDATE_PRODUCT]),
  catchAsync(productController.updateProduct)
);

// Delete a Product
router.delete(
  "/:id",
  isAuthenticated(),
  checkRole([UserRights.DELETE_PRODUCT]),
  catchAsync(productController.deleteProduct)
);

export default router;
