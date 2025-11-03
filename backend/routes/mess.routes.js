// write a basic router 

import { Router } from "express";
import {
    getMenu, submitFeedback
} from "../controllers/mess.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/menu", authMiddleware, getMenu);
router.post("/feedback", authMiddleware, submitFeedback);

export default router;
