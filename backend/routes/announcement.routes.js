import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roles.js';
import { announcementUpload } from '../config/cloudinary.js';
import { getAnnouncement, createAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller.js';

const router = Router();

router.get('/', getAnnouncement);
router.post(
    '/',
    authMiddleware,
    authorizeRoles('warden', 'admin'),
    announcementUpload.single('announcementFile'),
    createAnnouncement
);
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('warden', 'admin'),
    deleteAnnouncement
);

export default router;
