import { Router } from "express";
import {
    login,
    signup,
    logout,
    generateOTP,
    verifyOTP,
} from "../controllers/auth.controller.js";

const router = Router();

// Public routes
router.post("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
