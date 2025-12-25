import express from "express";
import auth from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getMyOrders);
router.get("/:id", auth, getOrderById);

export default router;
