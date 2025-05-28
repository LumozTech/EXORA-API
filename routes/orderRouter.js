import express from "express";
import { createOrder, getOrders, getQuote, updateOrderStatus } from "../controllers/OrderController.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.post("/quote", getQuote);
orderRouter.put("/status", updateOrderStatus);

export default orderRouter;
