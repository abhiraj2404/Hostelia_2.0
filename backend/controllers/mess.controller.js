import menuData from "../data/menu.json" with { type: 'json' };
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import z from "zod";
import { logger } from "../middleware/logger.js";
import { notifyUsers } from "../utils/notificationService.js";

const submitFeedbackSchema = z.object({
    date: z.coerce.date(),
    mealType: z.enum([ "Breakfast", "Lunch", "Snacks", "Dinner" ]),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().trim().optional().default(""),
});

export const getMenu = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Menu fetched successfully",
            menu: menuData,
        });
    } catch (error) {
        logger.error("Failed to load menu:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load menu",
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

        const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
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


