import { Router } from "express";
import {
  generateOTP,
  login,
  logout,
  signup,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
