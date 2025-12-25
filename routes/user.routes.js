import express from "express";
import {
  forgotPassword,
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", checkAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
