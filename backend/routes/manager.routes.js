import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import {
    getDashboardStats,
    listAllColleges,
    getPendingColleges,
    approveCollege,
    rejectCollege,
} from '../controllers/manager.controller.js';

const router = Router();

// All routes require manager role
router.use(authorizeRoles('manager'));

router.get('/stats', getDashboardStats);
router.get('/colleges', listAllColleges);
router.get('/colleges/pending', getPendingColleges);
router.post('/colleges/:id/approve', approveCollege);
router.post('/colleges/:id/reject', rejectCollege);

export default router;
