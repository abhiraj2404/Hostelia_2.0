import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import Menu from "../models/menu.model.js";
import z from "zod";
import { logger } from "../middleware/logger.js";
import { notifyUsers } from "../utils/notificationService.js";

const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
const mealTypes = [ "Breakfast", "Lunch", "Snacks", "Dinner" ];

const buildMenuResponse = (menuDocs) => {
    const menu = {};

    menuDocs.forEach((doc) => {
        menu[ doc.day ] = doc.meals;
    });

    return menu;
};

const submitFeedbackSchema = z.object({
    date: z.coerce.date(),
    mealType: z.enum(mealTypes),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().trim().optional().default(""),
});

const menuItemsSchema = z.array(
    z.string()
        .trim()
        .min(1, "Menu entries cannot be empty")
).min(1, "At least one menu item is required");

const dayMenuSchema = z.object({
    Breakfast: menuItemsSchema.optional(),
    Lunch: menuItemsSchema.optional(),
    Snacks: menuItemsSchema.optional(),
    Dinner: menuItemsSchema.optional(),
}).refine(
    (meals) => Object.values(meals).some((items) => Array.isArray(items) && items.length > 0),
    { message: "Provide at least one meal entry per day" }
);

const updateMenuSchema = z.object({
    updates: z.record(z.enum(days), dayMenuSchema).refine(
        (updates) => Object.keys(updates).length > 0,
        { message: "At least one day update is required" }
    ),
});

export const getMenu = async (req, res) => {
    try {
        const menuDocs = await Menu.find().lean();
        const menu = buildMenuResponse(menuDocs);

        return res.status(200).json({
            success: true,
            message: "Menu fetched successfully",
            menu,
        });
    } catch (error) {
        logger.error("Failed to load menu:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load menu",
        });
    }
}

export const updateMenu = async (req, res) => {
    try {
        const validationResult = updateMenuSchema.safeParse(req.body || {});

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { updates } = validationResult.data;

        const bulkOps = [];
        const updatedEntries = [];

        Object.entries(updates).forEach(([ day, meals ]) => {
            const setOperations = {};

            Object.entries(meals).forEach(([ mealType, items ]) => {
                if (!items || !items.length) {
                    return;
                }

                const sanitizedItems = items.map((item) => item.trim()).filter(Boolean);

                if (!sanitizedItems.length) {
                    return;
                }

                setOperations[ `meals.${mealType}` ] = sanitizedItems;
                updatedEntries.push(`${day} ${mealType}`);
            });

            if (Object.keys(setOperations).length > 0) {
                bulkOps.push({
                    updateOne: {
                        filter: { day },
                        update: {
                            $set: {
                                day,
                                ...setOperations,
                            },
                        },
                        upsert: true,
                    },
                });
            }
        });

        if (!bulkOps.length) {
            return res.status(400).json({
                success: false,
                message: "No valid menu updates provided",
            });
        }

        // Execute bulk write
        const bulkResult = await Menu.bulkWrite(bulkOps);

        logger.info("Menu updated", {
            updatesCount: updatedEntries.length,
            updatedEntries: updatedEntries.join(", "),
            updatedBy: req.user._id,
            matchedCount: bulkResult.matchedCount,
            modifiedCount: bulkResult.modifiedCount,
            upsertedCount: bulkResult.upsertedCount,
        });

        // Send notification to all students about the batch update
        try {
            const students = await User.find({ role: 'student' }).select('_id hostel');
            const studentIds = students.map((student) => student._id.toString());
            if (studentIds.length > 0) {
                const message = `${req.user.name} updated the mess menu`;

                await notifyUsers(studentIds, {
                    type: 'mess_menu_updated',
                    title: 'Mess Menu Updated',
                    message,
                    relatedEntityId: req.user._id,
                    relatedEntityType: 'mess',  
                });

                logger.info('Notifications sent for mess menu update', {
                    recipients: studentIds.length
                });
            }
        } catch (notifError) {
            logger.error('Failed to send notifications for mess menu update', {
                error: notifError.message
            });
        }

        const latestMenuDocs = await Menu.find().lean();

        return res.status(200).json({
            success: true,
            message: `Menu updated successfully (${updatedEntries.length} ${updatedEntries.length === 1 ? 'entry' : 'entries'})`,
            menu: buildMenuResponse(latestMenuDocs),
            updatedCount: updatedEntries.length,
        });
    } catch (error) {
        logger.error("Failed to update menu:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update menu",
        });
    }
}

export const submitFeedback = async (req, res) => {
    try {
        const validationResult = submitFeedbackSchema.safeParse(req.body || {});

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { date, mealType, rating, comment } = validationResult.data;

        const day = days[ date.getDay() ];
        const feedback = await Feedback.create({
            date,
            day,
            mealType,
            rating,
            comment,
            user: req.user._id,
        });

        logger.info("Feedback submitted", { userId: req.user._id, mealType, rating });

        // Notify admins and wardens about the new mess feedback
        try {
            // Find all admins
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminIds = admins.map((admin) => admin._id.toString());

            // Find wardens for the student's hostel
            const studentHostel = req.user.hostel;
            const wardens = await User.find({
                role: 'warden',
                hostel: studentHostel,
            }).select('_id');
            const wardenIds = wardens.map((warden) => warden._id.toString());

            // Combine admin and warden IDs
            const notifyUserIds = [ ...adminIds, ...wardenIds ];

            if (notifyUserIds.length > 0) {
                await notifyUsers(notifyUserIds, {
                    type: 'mess_feedback_submitted',
                    title: 'New Mess Feedback',
                    message: `${req.user.name} (${req.user.hostel}) submitted ${mealType} feedback with rating ${rating}/5`,
                    relatedEntityId: feedback._id,
                    relatedEntityType: 'mess',
                });
                logger.info('Notifications sent for mess feedback submission', {
                    feedbackId: feedback._id.toString(),
                    notifiedUsers: notifyUserIds.length,
                });
            }
        } catch (notifError) {
            // Log error but don't fail the request
            logger.error('Failed to send notifications for mess feedback submission', {
                error: notifError.message,
                feedbackId: feedback._id.toString(),
            });
        }

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        logger.error("Failed to submit feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
        });
    }
}

export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name email rollNo hostel roomNo year')
            .sort({ createdAt: -1 });

        logger.info("Feedbacks fetched", {
            count: feedbacks.length,
            requestedBy: req.user._id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            message: "Feedbacks fetched successfully",
            feedbacks,
            count: feedbacks.length,
        });
    } catch (error) {
        logger.error("Failed to fetch feedbacks:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch feedbacks",
        });
    }
}


