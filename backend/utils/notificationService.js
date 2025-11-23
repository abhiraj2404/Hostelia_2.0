import Notification from '../models/notification.model.js';
import { logger } from '../middleware/logger.js';

// Map to store active SSE connections: userId -> Set of response objects
const activeConnections = new Map();

/**
 * Create a notification and save it to the database
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID to notify
 * @param {string} notificationData.type - Notification type
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.relatedEntityId - Related entity ID (e.g., problem ID)
 * @param {string} notificationData.relatedEntityType - Related entity type (e.g., 'problem')
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(notificationData) {
    try {
        const notification = await Notification.create(notificationData);
        logger.info('Notification created', {
            notificationId: notification._id.toString(),
            userId: notification.userId.toString(),
            type: notification.type,
        });

        // Try to send via SSE if user is connected
        await sendNotificationToUser(notification.userId.toString(), notification);

        return notification;
    } catch (error) {
        logger.error('Failed to create notification', {
            error: error.message,
            notificationData,
        });
        throw error;
    }
}

/**
 * Send notification to user via SSE if they have an active connection
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
export async function sendNotificationToUser(userId, notification) {
    const connections = activeConnections.get(userId);
    if (!connections || connections.size === 0) {
        return; // User not connected, notification is saved in DB
    }

    const notificationData = {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEntityId: notification.relatedEntityId.toString(),
        relatedEntityType: notification.relatedEntityType,
        read: notification.read,
        createdAt: notification.createdAt,
    };

    // Send to all active connections for this user
    const deadConnections = [];
    connections.forEach((res) => {
        try {
            res.write(`data: ${JSON.stringify(notificationData)}\n\n`);
        } catch (error) {
            logger.warn('Failed to send notification via SSE', {
                userId,
                error: error.message,
            });
            deadConnections.push(res);
        }
    });

    // Remove dead connections
    deadConnections.forEach((res) => {
        connections.delete(res);
    });

    if (connections.size === 0) {
        activeConnections.delete(userId);
    }
}

/**
 * Add SSE connection for a user
 * @param {string} userId - User ID
 * @param {Object} res - Express response object
 */
export function addConnection(userId, res) {
    if (!activeConnections.has(userId)) {
        activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(res);

    // Remove connection when client closes
    res.on('close', () => {
        removeConnection(userId, res);
    });

    logger.info('SSE connection added', { userId });
}

/**
 * Remove SSE connection for a user
 * @param {string} userId - User ID
 * @param {Object} res - Express response object
 */
export function removeConnection(userId, res) {
    const connections = activeConnections.get(userId);
    if (connections) {
        connections.delete(res);
        if (connections.size === 0) {
            activeConnections.delete(userId);
        }
    }
    logger.info('SSE connection removed', { userId });
}

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch
 * @param {number} options.skip - Number of notifications to skip
 * @param {boolean} options.unreadOnly - Only fetch unread notifications
 * @returns {Promise<Object>} Notifications and count
 */
export async function getNotificationsForUser(userId, options = {}) {
    const { limit = 50, skip = 0, unreadOnly = false } = options;

    const query = { userId };
    if (unreadOnly) {
        query.read = false;
    }

    const [ notifications, totalCount ] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean(),
        Notification.countDocuments(query),
    ]);

    return {
        notifications,
        totalCount,
        hasMore: skip + notifications.length < totalCount,
    };
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<Object|null>} Updated notification or null if not found
 */
export async function markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true, readAt: new Date() },
        { new: true }
    );

    if (notification) {
        logger.info('Notification marked as read', {
            notificationId,
            userId,
        });
    }

    return notification;
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export async function markAllAsRead(userId) {
    const result = await Notification.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
    );

    logger.info('All notifications marked as read', {
        userId,
        count: result.modifiedCount,
    });

    return result.modifiedCount;
}

/**
 * Get unread count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread notification count
 */
export async function getUnreadCount(userId) {
    const count = await Notification.countDocuments({
        userId,
        read: false,
    });
    return count;
}

/**
 * Notify multiple users (helper for bulk notifications)
 * @param {Array<string>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data (without userId)
 */
export async function notifyUsers(userIds, notificationData) {
    const notifications = userIds.map((userId) => ({
        ...notificationData,
        userId,
    }));

    try {
        const createdNotifications = await Notification.insertMany(notifications);
        logger.info('Bulk notifications created', {
            count: createdNotifications.length,
            type: notificationData.type,
        });

        // Send via SSE to connected users
        for (const notification of createdNotifications) {
            await sendNotificationToUser(notification.userId.toString(), notification);
        }

        return createdNotifications;
    } catch (error) {
        logger.error('Failed to create bulk notifications', {
            error: error.message,
            userIds,
        });
        throw error;
    }
}

