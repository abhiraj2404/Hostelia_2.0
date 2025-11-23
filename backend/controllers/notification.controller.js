import {
    addConnection,
    removeConnection,
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
} from '../utils/notificationService.js';
import { logger } from '../middleware/logger.js';

/**
 * SSE endpoint for real-time notifications
 * GET /api/notifications/stream
 */
export async function streamNotificationsHandler(req, res) {
    const userId = req.user._id.toString();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Add connection to active connections
    addConnection(userId, res);

    // Keep connection alive with periodic ping
    const pingInterval = setInterval(() => {
        try {
            res.write(`: ping\n\n`);
        } catch (error) {
            clearInterval(pingInterval);
            removeConnection(userId, res);
        }
    }, 30000); // Ping every 30 seconds

    // Cleanup on client disconnect
    req.on('close', () => {
        clearInterval(pingInterval);
        removeConnection(userId, res);
        logger.info('SSE connection closed by client', { userId });
    });
}

/**
 * Get all notifications for authenticated user
 * GET /api/notifications
 */
export async function getNotificationsHandler(req, res) {
    try {
        const userId = req.user._id.toString();
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        const unreadOnly = req.query.unreadOnly === 'true';

        const result = await getNotificationsForUser(userId, {
            limit,
            skip,
            unreadOnly,
        });

        return res.status(200).json({
            success: true,
            message: 'Notifications fetched successfully',
            notifications: result.notifications,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
        });
    } catch (error) {
        logger.error('Failed to get notifications', {
            error: error.message,
            userId: req.user._id.toString(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
}

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
export async function markNotificationAsReadHandler(req, res) {
    try {
        const userId = req.user._id.toString();
        const { id } = req.params;

        const notification = await markAsRead(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification,
        });
    } catch (error) {
        logger.error('Failed to mark notification as read', {
            error: error.message,
            notificationId: req.params.id,
            userId: req.user._id.toString(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
        });
    }
}

/**
 * Mark all notifications as read for authenticated user
 * PATCH /api/notifications/read-all
 */
export async function markAllAsReadHandler(req, res) {
    try {
        const userId = req.user._id.toString();

        const count = await markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            count,
        });
    } catch (error) {
        logger.error('Failed to mark all notifications as read', {
            error: error.message,
            userId: req.user._id.toString(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
        });
    }
}

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export async function getUnreadCountHandler(req, res) {
    try {
        const userId = req.user._id.toString();

        const count = await getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            message: 'Unread count fetched successfully',
            count,
        });
    } catch (error) {
        logger.error('Failed to get unread count', {
            error: error.message,
            userId: req.user._id.toString(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
        });
    }
}

