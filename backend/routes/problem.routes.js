import { Router } from 'express';
import { } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roles.js';
import { problemUpload } from '../config/cloudinary.js';
import { handleMulterError } from '../middleware/multerErrorHandler.js';
import {
    createProblem,
    listProblems,
    addProblemComment,
    updateProblemStatus,
    verifyProblemResolution,
} from '../controllers/problem.controller.js';

const router = Router();

// Create a new problem (student only) with optional image upload
router.post('/', authorizeRoles('student'), handleMulterError(problemUpload.single('problemImage')), createProblem);

// List problems (role-based): student -> own problems, warden -> problems of their hostel, admin -> all problems
router.get('/', listProblems);

// Add a comment to a problem (all roles allowed)
router.post('/:id/comments', addProblemComment);

// Update problem status (warden/admin)
router.patch('/:id/status', authorizeRoles('warden', 'admin'), updateProblemStatus);

// Verification of resolution (student only)
router.patch('/:id/verify', authorizeRoles('student'), verifyProblemResolution);

export default router;
