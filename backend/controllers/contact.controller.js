import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/user.model.js";
import { logger } from "../middleware/logger.js";
import { sendEmail, getEmailUser } from "../utils/email-client.js";
import { notifyUsers } from "../utils/notificationService.js";

const contactSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("A valid email is required"),
    subject: z
        .string()
        .trim()
        .min(3, "Subject must be at least 3 characters")
        .max(200)
        .optional(),
    message: z.string().trim().min(1, "Message must be at least 1 characters").max(200),
});

export async function submitContactMessage(req, res) {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: z.treeifyError(parsed.error),
        });
    }

    const { name, email, subject, message } = parsed.data;

    try {
        const admins = await User.find({ role: "admin" }).select("_id email name");
        const adminIds = admins.map((admin) => admin._id.toString());
        const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

        const fallbackEmail = process.env.CONTACT_FALLBACK_EMAIL || process.env.SUPPORT_EMAIL;
        if (adminEmails.length === 0 && !fallbackEmail) {
            logger.warn("Contact message received but no admin email configured");
            return res.status(503).json({
                success: false,
                message: "Contact service is temporarily unavailable. Please try again later.",
            });
        }

        const recipients = adminEmails.length > 0 ? adminEmails : [ fallbackEmail ];
        const emailSubject = subject ? `Contact Form: ${subject}` : "New Contact Form Submission";
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-line; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
          ${message.replace(/\n/g, "<br />")}
        </p>
      </div>
    `;

        const fromAddress = getEmailUser() || "no-reply@hostelia.local";
        await sendEmail({
            from: `"Hostelia Contact" <${fromAddress}>`,
            to: recipients,
            subject: emailSubject,
            html: htmlMessage,
        });

        if (adminIds.length > 0) {
            const relatedId = new mongoose.Types.ObjectId();
            const preview = message.length > 160 ? `${message.slice(0, 157)}...` : message;
            await notifyUsers(adminIds, {
                type: "contact_message_received",
                title: subject ? `Contact: ${subject}` : "New Contact Message",
                message: `${name} (${email}) says: ${preview}`,
                relatedEntityId: relatedId,
                relatedEntityType: "contact",
            });
        }

        logger.info("Contact message forwarded to admins", {
            senderEmail: email,
            subject,
            notifiedAdmins: adminIds.length,
        });

        return res.status(200).json({
            success: true,
            message: "Thanks for reaching out. Our admin team will contact you shortly.",
        });
    } catch (error) {
        logger.error("Failed to process contact message", {
            error: error.message,
            senderEmail: email,
        });
        return res.status(500).json({
            success: false,
            message: "Failed to send your message. Please try again later.",
        });
    }
}


