import z from "zod";
import Announcement from "../models/announcement.model.js";
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { logger } from "../middleware/logger.js";
import { notifyUsers } from "../utils/notificationService.js";

export async function getAnnouncement(req, res) {
    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Announcements fetched successfully",
            data: announcements,
        });
    } catch (error) {
        logger.error("Error fetching announcements:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching announcements",
            error: error.message,
        });
    }
}

const createAnnouncementSchema = z.object({
    title: z.string()
        .min(1, "title is required")
        .refine((v) => v.trim() !== "", { message: "title cannot be blank" }),
    message: z.string()
        .min(1, "message is required")
        .refine((v) => v.trim() !== "", { message: "message cannot be blank" }),
});

export async function createAnnouncement(req, res) {
    try {


        const validationResult = createAnnouncementSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { title, message } = validationResult.data;

        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let fileUrl;
        if (req.file && req.file.buffer) {
            // If the uploaded file is a PDF (or other non-image), explicitly upload as 'raw'
            // Cloudinary serves PDFs correctly when stored as raw resources.
            const mimetype = (req.file.mimetype || "").toLowerCase();
            const isPdf = mimetype === "application/pdf" || mimetype.includes("pdf");
            const resourceType = isPdf ? "raw" : "auto";

            const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
                folder: "announcements",
                resource_type: resourceType,
            });
            fileUrl = uploadRes.secure_url;
        }

        const announcement = await Announcement.create({
            title,
            message,
            postedBy: {
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
            fileUrl,
        });

        logger.info("Announcement created", { id: announcement._id, by: req.user.email });

        // Notify all students about the new announcement
        try {
            const students = await User.find({ role: 'student' }).select('_id');
            const studentIds = students.map((student) => student._id.toString());

            if (studentIds.length > 0) {
                await notifyUsers(studentIds, {
                    type: 'announcement_created',
                    title: 'New Announcement',
                    message: `New announcement: ${title}`,
                    relatedEntityId: announcement._id,
                    relatedEntityType: 'announcement',
                });
                logger.info('Notifications sent for announcement creation', {
                    announcementId: announcement._id.toString(),
                    notifiedUsers: studentIds.length,
                });
            }
        } catch (notifError) {
            // Log error but don't fail the request
            logger.error('Failed to send notifications for announcement creation', {
                error: notifError.message,
                announcementId: announcement._id.toString(),
            });
        }

        return res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement,
        });
    } catch (error) {
        logger.error("Error creating announcement:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating announcement",
            error: error.message,
        });
    }
}

export async function deleteAnnouncement(req, res) {
    try {
        const { id } = req.params;
        const doc = await Announcement.findByIdAndDelete(id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        logger.info("Announcement deleted", { id });
        // We only store fileUrl; no Cloudinary cleanup performed.
        return res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        logger.error("Error deleting announcement:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting announcement",
            error: error.message,
        });
    }
}

const commentSchema = z.object({
    message: z.string().trim().min(1).max(2000),
});

export async function addAnnouncementComment(req, res) {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: parsed.error.flatten(),
        });
    }
    const { id } = req.params;
    try {
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res
                .status(404)
                .json({ success: false, message: "Announcement not found" });
        }

        announcement.comments.push({
            user: req.user._id,
            role: req.user.role,
            message: parsed.data.message,
        });
        await announcement.save();
        logger.info("Comment added to announcement", {
            announcementId: announcement._id.toString(),
            userId: req.user._id.toString(),
        });
        return res
            .status(201)
            .json({ success: true, message: "Comment added", data: announcement });
    } catch (err) {
        logger.error("Failed to add comment", {
            error: err.message,
            announcementId: id,
        });
        return res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: err.message,
        });
    }
}