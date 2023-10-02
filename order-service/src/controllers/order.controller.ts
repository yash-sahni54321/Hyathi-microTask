import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import {
  CreateOrderRequestBody,
  UpdateOrderRequestBody,
  OrderResponse,
} from "../types";

const prisma = new PrismaClient();

import fetch from "node-fetch";
import { Product } from "../types/product";

import EventEmitter from "events";
import axios from "axios";
const eventEmitter = new EventEmitter();

// Create a new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items } = req.body;
    const userId = req.user!.id;

    const itemDetails = await Promise.all(
      items.map(async (item: any) => {
        const productId = item.productId;
        const productData = await prisma.product.findUnique({
          where: { id: productId },
        });
        return { ...item, productData };
      })
    );

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

    itemDetails.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newstock = product.stock - item.quantity;
        await updateProductStock(item.productId, newstock);
      } else {
        console.error(`Product with ID ${item.productId} not found.`);
      }
    });

    // itemDetails.map((item) => {
    //   eventEmitter.emit("order-created", {
    //     id:items.id,
    //     stock:item.quantity
    //   })
    // })
    // // eventEmitter.emit("orderCreated", {
    // //   id: newOrder.id,
    // //   items: itemDetails,
    // // });

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
// Update product stock
export const updateProductStock = async (
  productId: string,
  updatedStock: number
) => {
  try {
    // Use Prisma to update the product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: updatedStock,
      },
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw new Error("Could not update product stock.");
  }
};
// // api to update the product stock
// export const updateProductStock = async (req: Request, res: Response) => {
//   try {
//     const product: Product = req.body;

//     const updatedProduct = await prisma.product.update({
//       where: { id: product.id },
//       data: {
//         stock: product.stock,
//       },
//     });

//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     console.error("Error while apdating", error);
//     const response = {
//       success: false,
//       error: "Could not update product stock.",
//     };

//     res.status(500).json(response);
//   }
// };

// eventEmitter.on("orderCreated", async ({ orderId, items }) => {
//   try {
//     // Call the updateProductStock API with the necessary data
//     const response = await axios.post("/update-stock", {
//       orderId,
//       items,
//     });

//     // Handle the response as needed
//     console.log("Product stock updated:", response.data);
//   } catch (error) {
//     // Handle errors
//     console.error("Error updating product stock:", error);
//   }
// });

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
  updateProductStock,
};
