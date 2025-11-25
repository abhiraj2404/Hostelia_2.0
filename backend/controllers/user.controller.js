import User from "../models/user.model.js";
import { logger } from "../middleware/logger.js";
import { z } from "zod";

const getUserByIdSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

/**
 * Get user by ID
 * - Admin and warden can access any user
 * - Students can only access their own user info
 */
export const getUserById = async (req, res) => {
    try {
        // Validate userId from params
        const validationResult = getUserByIdSchema.safeParse({
            userId: req.params.userId,
        });

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { userId } = validationResult.data;
        const requesterRole = req.user.role;
        const requesterId = req.user._id.toString();

        // Authorization check: Students can only access their own info
        if (requesterRole === "student" && userId !== requesterId) {
            logger.warn("Student attempted to access another user's info", {
                requesterId,
                requestedUserId: userId,
            });
            return res.status(403).json({
                success: false,
                message: "Forbidden - You can only access your own information",
            });
        }

        // Find user by ID
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        logger.info("User info retrieved", {
            requestedUserId: userId,
            requesterRole,
            requesterId,
        });

        return res.status(200).json({
            success: true,
            message: "User information retrieved successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                year: user.year,
                hostel: user.hostel,
                roomNo: user.roomNo,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        logger.error("Error retrieving user info:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get all students
 * - Admin: gets all students
 * - Warden: gets only students from their hostel
 */
export const getAllStudents = async (req, res) => {
    try {
        const requesterRole = req.user.role;
        const requesterHostel = req.user.hostel;

        // Build query filter
        let filter = { role: "student" };

        // If warden, filter by their hostel
        if (requesterRole === "warden") {
            if (!requesterHostel) {
                return res.status(400).json({
                    success: false,
                    message: "Warden must have a hostel assigned",
                });
            }
            filter.hostel = requesterHostel;
        }

        // Find all students (with optional hostel filter for warden)
        const students = await User.find(filter)
            .select("-password")
            .sort({ name: 1 });

        logger.info("Students retrieved", {
            requesterRole,
            requesterHostel,
            count: students.length,
        });

        return res.status(200).json({
            success: true,
            message: "Students retrieved successfully",
            students: students.map((student) => ({
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                rollNo: student.rollNo,
                year: student.year,
                hostel: student.hostel,
                roomNo: student.roomNo,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            })),
            count: students.length,
        });
    } catch (error) {
        logger.error("Error retrieving students:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get all wardens (admin only)
 */
export const getAllWardens = async (req, res) => {
    try {
        // Find all wardens
        const wardens = await User.find({ role: "warden" })
            .select("-password")
            .sort({ hostel: 1, name: 1 });

        logger.info("Wardens retrieved", {
            requesterRole: req.user.role,
            count: wardens.length,
        });

        return res.status(200).json({
            success: true,
            message: "Wardens retrieved successfully",
            wardens: wardens.map((warden) => ({
                _id: warden._id,
                name: warden.name,
                email: warden.email,
                role: warden.role,
                hostel: warden.hostel,
                createdAt: warden.createdAt,
                updatedAt: warden.updatedAt,
            })),
            count: wardens.length,
        });
    } catch (error) {
        logger.error("Error retrieving wardens:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get only the name and role for a user
 */
export const getUserName = async (req, res) => {
    try {
        const validationResult = getUserByIdSchema.safeParse({
            userId: req.params.userId,
        });

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { userId } = validationResult.data;
        const user = await User.findById(userId).select("name role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        logger.info("User name retrieved", { userId });

        return res.status(200).json({
            success: true,
            message: "User name retrieved successfully",
            user: {
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error("Error retrieving user name:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};