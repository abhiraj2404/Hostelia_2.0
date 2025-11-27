import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import Feedback from "../models/feedback.model.js";
import Announcement from "../models/announcement.model.js";
import Transit from "../models/transit.model.js";
import Notification from "../models/notification.model.js";
import FeeSubmission from "../models/feeSubmission.model.js";
import { sendEmail, getEmailUser } from "../utils/email-client.js";
import { logger } from "../middleware/logger.js";
import { z } from "zod";

const getUserByIdSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

const updateableYears = [ "UG-1", "UG-2", "UG-3", "UG-4" ];
const updateableHostels = [ "BH-1", "BH-2", "BH-3", "BH-4" ];

const updateUserDetailsSchema = z.object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    rollNo: z.string().trim().min(1, "Roll number cannot be empty").optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    year: z.enum(updateableYears).optional(),
    hostel: z.enum(updateableHostels).optional(),
    roomNo: z.string().trim().min(1, "Room number cannot be empty").optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
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

export const updateUserDetails = async (req, res) => {
    try {
        const idValidation = getUserByIdSchema.safeParse({
            userId: req.params.userId,
        });

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(idValidation.error),
            });
        }

        const bodyValidation = updateUserDetailsSchema.safeParse(req.body || {});

        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(bodyValidation.error),
            });
        }

        const { userId } = idValidation.data;
        const updatePayload = bodyValidation.data;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatePayload },
            {
                new: true,
                runValidators: true,
                context: "query",
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update FeeSubmission entry if name or email was updated
        if (updatePayload.name || updatePayload.email) {
            const feeSubmissionUpdate = {};
            if (updatePayload.name) {
                feeSubmissionUpdate.studentName = updatedUser.name;
            }
            if (updatePayload.email) {
                feeSubmissionUpdate.studentEmail = updatedUser.email;
            }

            try {
                await FeeSubmission.updateOne(
                    { studentId: userId },
                    { $set: feeSubmissionUpdate }
                );
                logger.info("FeeSubmission updated for user", {
                    userId,
                    updatedFields: Object.keys(feeSubmissionUpdate),
                });
            } catch (feeError) {
                // Log error but don't fail the request if FeeSubmission doesn't exist
                logger.warn("Failed to update FeeSubmission for user", {
                    userId,
                    error: feeError.message,
                });
            }
        }

        logger.info("User details updated", {
            userId,
            updatedFields: Object.keys(updatePayload),
            updatedBy: req.user?._id,
        });

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[ 0 ] || "field";
            return res.status(409).json({
                success: false,
                message: `Duplicate value for ${duplicateField}`,
            });
        }

        logger.error("Failed to update user details", {
            error: error.message,
            userId: req.params.userId,
        });

        return res.status(500).json({
            success: false,
            message: "Failed to update user details",
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
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
        const session = await User.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const userSnapshot = {
                name: user.name,
                email: user.email,
                role: user.role,
            };

            const [ problemsDeleted, feedbackDeleted, transitDeleted, notificationsDeleted, feeSubmissionDeleted, announcementDeleted, problemCommentsUpdated, announcementCommentsUpdated ] = await Promise.all([
                Problem.deleteMany({ studentId: userId }, { session }),
                Feedback.deleteMany({ user: userId }, { session }),
                Transit.deleteMany({ studentId: userId }, { session }),
                Notification.deleteMany({ userId }, { session }),
                FeeSubmission.deleteOne({ studentId: userId }, { session }),
                Announcement.deleteMany({ "postedBy.email": userSnapshot.email }, { session }),
                Problem.updateMany({ "comments.user": userId }, { $pull: { comments: { user: userId } } }, { session }),
                Announcement.updateMany({ "comments.user": userId }, { $pull: { comments: { user: userId } } }, { session }),
            ]);

            await User.deleteOne({ _id: userId }, { session });

            await session.commitTransaction();
            session.endSession();

            try {
                if (userSnapshot.email) {
                    const senderName = req.user?.name || "Administrator";
                    const fromEmail = getEmailUser();
                    await sendEmail({
                        from: `Hostelia - ${senderName} <${fromEmail}>`,
                        to: userSnapshot.email,
                        subject: "Your Hostelia account has been deleted",
                        html: `
                            <p>Hi ${userSnapshot.name || "there"},</p>
                            <p>This is to inform you that your Hostelia account has been deleted by the administration. All associated records have been removed from our system.</p>
                            <p>If you believe this was a mistake or have any questions, please contact the administration team.</p>
                            <p>Regards,<br/>${senderName}<br/>Hostelia Admin Team</p>
                        `,
                    });
                }
            } catch (emailError) {
                logger.error("Failed to send account deletion email", {
                    error: emailError.message,
                    userId,
                });
            }

            logger.info("User deleted successfully", {
                userId,
                deletedBy: req.user?._id,
            });

            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
                deletedUserId: userId,
                stats: {
                    problemsDeleted: problemsDeleted.deletedCount,
                    feedbackDeleted: feedbackDeleted.deletedCount,
                    transitDeleted: transitDeleted.deletedCount,
                    notificationsDeleted: notificationsDeleted.deletedCount,
                    feeSubmissionDeleted: feeSubmissionDeleted.deletedCount,
                    announcementsDeleted: announcementDeleted.deletedCount,
                    problemCommentsUpdated: problemCommentsUpdated.modifiedCount,
                    announcementCommentsUpdated: announcementCommentsUpdated.modifiedCount,
                },
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        logger.error("Failed to delete user", { error: error.message, userId: req.params.userId });
        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });
    }
};