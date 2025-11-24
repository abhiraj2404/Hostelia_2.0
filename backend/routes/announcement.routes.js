import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roles.js';
import { announcementUpload } from '../config/cloudinary.js';
import { handleMulterError } from '../middleware/multerErrorHandler.js';
import { getAnnouncement, createAnnouncement, deleteAnnouncement, addAnnouncementComment } from '../controllers/announcement.controller.js';

const router = Router();

router.get('/', getAnnouncement);
router.post(
    '/',
    authorizeRoles('warden', 'admin'),
    handleMulterError(announcementUpload.single('announcementFile')),
    createAnnouncement
);
router.delete(
    '/:id',
    authorizeRoles('warden', 'admin'),
    deleteAnnouncement
);

// Add a comment to an announcement (all roles allowed)
router.post('/:id/comments', addAnnouncementComment);

export default router;
