import { Router } from 'express';
import {
    streamNotificationsHandler,
    getNotificationsHandler,
    markNotificationAsReadHandler,
    markAllAsReadHandler,
    getUnreadCountHandler,
} from '../controllers/notification.controller.js';

const router = Router();

// SSE endpoint for real-time notifications
router.get('/stream', streamNotificationsHandler);

// Get all notifications for authenticated user
router.get('/', getNotificationsHandler);

// Get unread notification count
router.get('/unread-count', getUnreadCountHandler);

// Mark a single notification as read
router.patch('/:id/read', markNotificationAsReadHandler);

// Mark all notifications as read
router.patch('/read-all', markAllAsReadHandler);

export default router;

