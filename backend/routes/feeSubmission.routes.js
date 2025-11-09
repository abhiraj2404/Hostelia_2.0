import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import { feeUpload } from '../config/cloudinary.js';
import { handleMulterError } from '../middleware/multerErrorHandler.js';
import {
    getFeeStatus,
    submitHostelFee,
    submitMessFee,
    updateFeeStatus,
    sendFeeReminder,
    sendBulkFeeReminders,
} from '../controllers/feeSubmission.controller.js';

const router = Router();

// Get fee status (student: own, admin: all)
router.get('/', getFeeStatus);

// Submit hostel fee document (student only)
router.post('/hostel', authorizeRoles('student'), handleMulterError(feeUpload.single('documentImage')), submitHostelFee);

// Submit mess fee document (student only)
router.post('/mess', authorizeRoles('student'), handleMulterError(feeUpload.single('documentImage')), submitMessFee);

// Update fee status (admin only)
router.patch('/:studentId/status', authorizeRoles('admin'), updateFeeStatus);

// Send single fee reminder (admin only)
router.post('/email/reminder', authorizeRoles('admin'), sendFeeReminder);

// Send bulk fee reminders (admin only)
router.post('/email/bulk-reminder', authorizeRoles('admin'), sendBulkFeeReminders);

export default router;

