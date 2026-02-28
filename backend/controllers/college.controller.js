import bcrypt from "bcrypt";
import z from "zod";
import { logger } from "../middleware/logger.js";
import College from "../models/college.model.js";
import Hostel from "../models/hostel.model.js";
import Mess from "../models/mess.model.js";
import User from "../models/user.model.js";
import { getEmailUser, sendEmail } from "../utils/email-client.js";
import { uploadBufferToCloudinary, getSecureUrl } from "../config/cloudinary.js";

const registerCollegeSchema = z.object({
    collegeName: z.string().min(1, "College name is required").trim(),
    emailDomain: z
        .string()
        .min(1, "Email domain is required")
        .trim()
        .toLowerCase()
        .regex(/^@/, "Email domain must start with @"),
    adminEmail: z.string().email("Invalid admin email format").trim().toLowerCase(),
    address: z.string().optional(),
    password: z.string(),
    hostels: z
        .array(z.string().min(1, "Hostel name cannot be empty").trim())
        .min(1, "At least one hostel is required"),
    messes: z
        .array(z.string().min(1, "Mess name cannot be empty").trim())
        .min(1, "At least one mess is required"),
});

/**
 * Register a new College (SaaS Onboarding)
 */
export const registerCollege = async (req, res) => {
    try {
        // Normalize FormData array fields (hostels[] -> hostels, messes[] -> messes)
        if (req.body[ 'hostels[]' ]) {
            req.body.hostels = Array.isArray(req.body[ 'hostels[]' ]) ? req.body[ 'hostels[]' ] : [ req.body[ 'hostels[]' ] ];
            delete req.body[ 'hostels[]' ];
        }
        if (req.body[ 'messes[]' ]) {
            req.body.messes = Array.isArray(req.body[ 'messes[]' ]) ? req.body[ 'messes[]' ] : [ req.body[ 'messes[]' ] ];
            delete req.body[ 'messes[]' ];
        }

        const validationResult = registerCollegeSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const {
            collegeName,
            emailDomain,
            adminEmail,
            address,
            hostels,
            messes,
            password,
        } = validationResult.data;

        // Check if college/domain already exists
        const existingCollege = await College.findOne({
            $or: [ { emailDomain }, { adminEmail } ],
        });
        if (existingCollege) {
            return res.status(400).json({
                success: false,
                message:
                    "A college with this email domain or admin email is already registered.",
            });
        }

        // Verify admin email matches the provided email domain
        if (!adminEmail.endsWith(emailDomain)) {
            return res.status(400).json({
                success: false,
                message: `Admin email (${adminEmail}) must belong to the provided college domain (${emailDomain}).`,
            });
        }

        // Upload logo to Cloudinary if provided
        let logoUrl = null;
        if (req.file) {
            try {
                const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
                    folder: "hostelia/college-logos",
                    resource_type: "image",
                });
                logoUrl = getSecureUrl(uploadResult);
            } catch (uploadError) {
                logger.error("Logo upload failed:", uploadError);
                // Non-fatal: proceed without logo
            }
        }

        // Phase 1: Create College
        const newCollege = await College.create({
            name: collegeName,
            emailDomain,
            adminEmail,
            address,
            ...(logoUrl && { logo: logoUrl }),
        });

        // Phase 2: Create Hostels
        const hostelDocs = hostels.map((hostelName) => ({
            name: hostelName,
            collegeId: newCollege._id,
        }));
        await Hostel.insertMany(hostelDocs);

        // Phase 3: Create Messes
        const messDocs = messes.map((messName) => ({
            name: messName,
            collegeId: newCollege._id,
        }));
        await Mess.insertMany(messDocs);

        // Phase 4: Create Admin User
        // const plainPassword =
        //     Math.random().toString(36).slice(-8) +
        //     Math.random().toString(36).slice(-4);
        const plainPassword = password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        await User.create({
            name: "College Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "collegeAdmin",
            collegeId: newCollege._id,
            // rollNo, hostelId, roomNo are intentionally omitted
        });

        // Phase 5: Send Credentials via Email
        const mailOptions = {
            from: `"Hostelia Platform" <${getEmailUser()}>`,
            to: adminEmail,
            subject: "Welcome to Hostelia - Campus Registration Successful!",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Welcome to Hostelia!</h2>
          <p>Dear ${collegeName} Administrator,</p>
          <p>Your campus has been successfully registered on our platform.</p>
          <p>Here are your admin login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${adminEmail}</p>
            <p><strong>Password:</strong> <span style="font-family: monospace;">${plainPassword}</span></p>
          </div>
          <p style="color: #ef4444;"><strong>Important:</strong> Please log in and change your password immediately.</p>
          <p>Best regards,<br>Hostelia Team</p>
        </div >
    `,
        };

        await sendEmail(mailOptions);
        logger.info("College registered successfully", {
            collegeId: newCollege._id,
            emailDomain,
        });

        return res.status(201).json({
            success: true,
            message:
                "College registered successfully. Login credentials sent to the admin email.",
            college: {
                id: newCollege._id,
                name: newCollege.name,
                emailDomain: newCollege.emailDomain,
            },
        });
    } catch (error) {
        logger.error("Error registering college:", error);
        return res.status(500).json({
            success: false,
            message: "Error registering college",
            error: error.message,
        });
    }
};

/**
 * Get list of registered colleges
 */
export const getCollegesList = async (req, res) => {
    try {
        const colleges = await College.find({}).sort({ name: 1 });
        return res.status(200).json({
            success: true,
            colleges,
        });
    } catch (error) {
        logger.error("Error fetching colleges list:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching colleges",
        });
    }
};

/**
 * Get hostels for a specific college (public, for signup dropdown)
 */
export const getCollegeHostels = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const hostels = await Hostel.find({ collegeId })
            .select("_id name")
            .sort({ name: 1 });
        return res.status(200).json({
            success: true,
            hostels,
        });
    } catch (error) {
        logger.error("Error fetching college hostels:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching hostels",
        });
    }
};
