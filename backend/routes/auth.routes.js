import { Router } from "express";
import {
  generateOTP,
  login,
  logout,
  managerLogin,
  signup,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { domainValidation } from "../middleware/domainValidation.middleware.js";

const router = Router();

// Public routes
router.post("/generate-otp", domainValidation, generateOTP);
router.post("/verify-otp", domainValidation, verifyOTP);
router.post("/signup", domainValidation, signup);
router.post("/login", login);
router.post("/manager-login", managerLogin);
router.post("/logout", authMiddleware, logout);

export default router;

