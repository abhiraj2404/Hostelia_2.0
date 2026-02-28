import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import { createHostel, listHostels } from '../controllers/hostel.controller.js';

const router = Router();

// List all hostels with their wardens
router.get('/list', listHostels);

// Create a new hostel (collegeAdmin only)
router.post('/create', authorizeRoles('collegeAdmin'), createHostel);

export default router;
