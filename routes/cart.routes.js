import express from "express";
import auth from "../middleware/auth.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controller/cart.controller.js";

const router = express.Router();

router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.put("/:bookId", auth, updateCartItem);
router.delete("/:bookId", auth, removeCartItem);
router.delete("/", auth, clearCart);

export default router;
