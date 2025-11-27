import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import {
    appointWarden,
    listWardens,
} from '../controllers/warden.controller.js';

const router = Router();

// Get all wardens (admin only)
router.get('/', authorizeRoles('admin'), listWardens);

// Appoint a student as warden (admin only)
router.post('/create', authorizeRoles('admin'), appointWarden);


export default router;

