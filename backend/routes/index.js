import { Router } from "express";
import authRouter from "./auth.routes.js";
import messRouter from "./mess.routes.js";
import problemRouter from "./problem.routes.js";
import announcementRouter from "./announcement.routes.js";
import feeSubmissionRouter from "./feeSubmission.routes.js";
import transitRouter from "./transit.routes.js";
import wardenRouter from "./warden.routes.js";
import notificationRouter from "./notification.routes.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// API routes
router.use("/auth", authRouter);
router.use("/mess", authMiddleware, messRouter);
router.use("/problem", authMiddleware, problemRouter);
router.use("/announcement", authMiddleware, announcementRouter);
router.use("/fee", authMiddleware, feeSubmissionRouter);
router.use("/transit", authMiddleware, transitRouter);
router.use("/warden", authMiddleware, wardenRouter);
router.use("/notifications", authMiddleware, notificationRouter);

export default router;
