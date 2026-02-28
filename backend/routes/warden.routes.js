import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import {
    appointWarden,
    listWardens,
} from '../controllers/warden.controller.js';

const router = Router();

// Get all wardens (collegeAdmin only)
router.get('/', authorizeRoles('collegeAdmin'), listWardens);

// Appoint a student as warden (collegeAdmin only)
router.post('/create', authorizeRoles('collegeAdmin'), appointWarden);


export default router;

