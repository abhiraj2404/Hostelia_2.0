import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import messRouter from "./mess.routes.js";
import problemRouter from "./problem.routes.js";
import announcementRouter from "./announcement.routes.js";
import feeSubmissionRouter from "./feeSubmission.routes.js";
import transitRouter from "./transit.routes.js";
import wardenRouter from "./warden.routes.js";
import notificationRouter from "./notification.routes.js";
import contactRouter from "./contact.routes.js";
import collegeRouter from "./college.routes.js";
import hostelRouter from "./hostel.routes.js"; // Added this line
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// API routes
router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);
router.use("/mess", authMiddleware, messRouter);
router.use("/problem", authMiddleware, problemRouter);
router.use("/announcement", authMiddleware, announcementRouter);
router.use("/fee", authMiddleware, feeSubmissionRouter);
router.use("/transit", authMiddleware, transitRouter);
router.use("/warden", authMiddleware, wardenRouter);
router.use("/notifications", authMiddleware, notificationRouter);
router.use("/contact", contactRouter);
router.use("/college", collegeRouter);
router.use("/hostel", authMiddleware, hostelRouter);

export default router;
