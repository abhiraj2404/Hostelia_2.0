import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.js';
import {
    createTransitEntry,
    listTransitEntries,
} from '../controllers/transit.controller.js';

const router = Router();

// Create a new transit entry (student only)
router.post('/', authorizeRoles('student'), createTransitEntry);

// List all transit entries (all authenticated users)
router.get('/', listTransitEntries);

export default router;

