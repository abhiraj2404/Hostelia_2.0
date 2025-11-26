import { Router } from "express";
import { feeUpload } from "../config/cloudinary.js";
import {
  getFeeStatus,
  sendBulkFeeReminders,
  sendFeeReminder,
  submitHostelFee,
  submitMessFee,
  updateFeeStatus,
} from "../controllers/feeSubmission.controller.js";
import { handleMulterError } from "../middleware/multerErrorHandler.js";
import { authorizeRoles } from "../middleware/roles.js";

const router = Router();

// Get fee status (student: own, warden: hostel, admin: all)
router.get("/", getFeeStatus);

// Submit hostel fee document (student only)
router.post(
  "/hostel",
  authorizeRoles("student"),
  handleMulterError(feeUpload.single("documentImage")),
  submitHostelFee
);

// Submit mess fee document (student only)
router.post(
  "/mess",
  authorizeRoles("student"),
  handleMulterError(feeUpload.single("documentImage")),
  submitMessFee
);

// Update fee status (admin only)
router.patch("/:studentId/status", authorizeRoles("admin"), updateFeeStatus);

// Send single fee reminder (admin and warden)
router.post(
  "/email/reminder",
  authorizeRoles("admin", "warden"),
  sendFeeReminder
);

// Send bulk fee reminders (admin and warden)
router.post(
  "/email/bulk-reminder",
  authorizeRoles("admin", "warden"),
  sendBulkFeeReminders
);

export default router;
