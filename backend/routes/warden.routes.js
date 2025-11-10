import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import {
    appointWarden,
    removeWarden,
    listWardens,
} from '../controllers/warden.controller.js';

const router = Router();

// Get all wardens (admin only)
router.get('/', authorizeRoles('admin'), listWardens);

// Appoint a student as warden (admin only)
router.post('/appoint', authorizeRoles('admin'), appointWarden);

// Remove warden and downgrade to student (admin only)
router.post('/remove', authorizeRoles('admin'), removeWarden);

export default router;

