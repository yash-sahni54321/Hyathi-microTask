import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  CreateOrderRequestBody,
  UpdateOrderRequestBody,
  OrderResponse,
} from "../types";

const prisma = new PrismaClient();

import fetch from "node-fetch";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { user, items, total, status, createdAt } = req.body;
    const order: CreateOrderRequestBody = req.body;
    const userId = req.user!.id;

    const productPromises = order.items.map(async (item) => {
      const productId = item.productId;
      const response = await fetch(
        `postgres://yash:3l3hrooBQ9d32RohvKDtUry63YE6JRze@dpg-ck9f19egtj9c73cgiukg-a.oregon-postgres.render.com/ecommerce/products/${productId}`
      );
      const productData = await response.json();
      return { ...item, productData };
    });

    const itemDetails = await Promise.all(productPromises);

    const calculatedTotal = itemDetails.reduce((total, item) => {
      const productPrice = item.productData.price;
      const quantity = item.quantity;
      return total + productPrice * quantity;
    }, 0);

    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        total: calculatedTotal,
        status: "initiated",
        items: {
          createMany: {
            data: itemDetails.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });

    const response: OrderResponse = {
      success: true,
      order: newOrder,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating order:", error);
    const response: OrderResponse = {
      success: false,
      error: "Could not create the order.",
    };

    res.status(500).json(response);
  }
};

// Update an existing order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const requestBody: UpdateOrderRequestBody = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      const response: OrderResponse = {
        success: false,
        error: "Order not found.",
      };
      return res.status(404).json(response);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: requestBody.status },
    });

    const response: OrderResponse = {
      success: true,
      order: updatedOrder,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating order:", error);
    const response: OrderResponse = {
      success: false,
      error: "Could not update the order.",
    };

    res.status(500).json(response);
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    // Check if the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      const response: OrderResponse = {
        success: false,
        error: "Order not found.",
      };
      return res.status(404).json(response);
    }

    // Cancel the order by setting its status to "cancelled"
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    const response: OrderResponse = {
      success: true,
      order: cancelledOrder,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error cancelling order:", error);
    const response: OrderResponse = {
      success: false,
      error: "Could not cancel the order.",
    };

    res.status(500).json(response);
  }
};

export default {
  createOrder,
  updateOrder,
  cancelOrder,
};
