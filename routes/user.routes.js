import express from "express";
import {
  forgotPassword,
  getUserById,
  getUsers,
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
  deleteUser,
  contactUs,
  getStats,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", checkAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/contact", contactUs);
router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
