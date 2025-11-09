import * as menu from "../data/menu.json" with { type: 'json' };
import Feedback from "../models/feedback.model.js";
import z from "zod";
import { logger } from "../middleware/logger.js";

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


