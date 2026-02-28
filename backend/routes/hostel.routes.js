import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import { createHostel } from '../controllers/hostel.controller.js';

const router = Router();

// Create a new hostel (collegeAdmin only)
router.post('/create', authorizeRoles('collegeAdmin'), createHostel);

export default router;
