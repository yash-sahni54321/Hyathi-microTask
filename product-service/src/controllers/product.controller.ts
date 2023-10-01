import express from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { RedisClient } from "../../redisClient";
const prisma = new PrismaClient();
const router = express.Router();
const redisClient = new RedisClient();

// Create a Product
const createProduct = async (req: Request, res: Response) => {
    const { name, description, price, stock, createdByUserId } = req.body;
    const userId = req.user!.id;
    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            stock,
            creator: userId,
        },
    });
    await redisClient.set(`product-${product.id}`, product);
    res.status(201).json({ success: true, product });
};

// Get All Products
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json({ success: true, products });
    } catch (error) {
        next(error);
    }
};

// Get Product Details
const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const cacheProduct = await redisClient.get(`product-${id}`);
    if (cacheProduct) {
        return res.status(200).json({ success: true, product: cacheProduct });
    }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }
    await redisClient.set(`product-${product.id}`, product);
    res.status(200).json({ success: true, product });
};

// Update Product
const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, price, stock, createdByUserId } = req.body;
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            stock,
        },
    });
    await redisClient.set(`product-${updatedProduct.id}`, updatedProduct);
    res.status(200).json({ success: true, product: updatedProduct });
};

// Delete a Product
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    await prisma.product.delete({ where: { id } });
    await redisClient.delete(`product-${id}`);
    res.status(200).json({ success: true, message: "Product Deleted Successfully" });
};

export default {
    createProduct,
    getAllProducts,
    getProductDetails,
    deleteProduct,
    updateProduct,
};
