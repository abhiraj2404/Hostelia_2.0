import z from "zod";
import Announcement from "../models/announcement.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { logger } from "../middleware/logger.js";

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