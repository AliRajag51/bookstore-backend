import express from "express";
import { forgotPassword, loginUser, registerUser } from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

export default router;
