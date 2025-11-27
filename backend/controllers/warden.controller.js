import { z } from 'zod';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { logger } from '../middleware/logger.js';
import { sendEmail, getEmailUser } from '../utils/email-client.js';

const appointWardenSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email().refine((email) => email.endsWith("@iiits.in"), {
        message: "Email must be a valid @iiits.in address.",
    }),
    hostel: z.enum([ 'BH-1', 'BH-2', 'BH-3', 'BH-4' ], {
        errorMap: () => ({ message: "Hostel must be one of: BH-1, BH-2, BH-3, BH-4" })
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function appointWarden(req, res) {
    const parsed = appointWardenSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parsed.error),
        });
    }

    const { name, email, hostel, password } = parsed.data;
    const { _id: adminId } = req.user;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Check if hostel already has 2 wardens
        const wardenCount = await User.countDocuments({
            role: 'warden',
            hostel: hostel,
        });

        if (wardenCount >= 2) {
            return res.status(400).json({
                success: false,
                message: `Hostel ${hostel} already has 2 wardens. Maximum 2 wardens allowed per hostel.`,
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new warden user
        const newWarden = await User.create({
            name,
            email,
            hostel,
            password: hashedPassword,
            role: 'warden',
        });

        // Send email to warden with credentials
        const mailOptions = {
            from: `"Hostelia - IIIT Sri City" <${getEmailUser()}>`,
            to: email,
            subject: "Warden Appointment - Hostelia",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
                    <h2 style="color: #4f46e5;">Warden Appointment - Hostelia</h2>
                    <p>Hello ${name},</p>
                    <p>You have been appointed as a warden for <strong>${hostel}</strong> in Hostelia.</p>
                    <p>Your login credentials are:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p style="color: #dc2626; font-weight: bold;">Please keep these credentials secure and change your password after your first login.</p>
                    <p>You can now log in to the Hostelia system using these credentials.</p>
                    <p>Best regards,<br>Hostelia Team</p>
                </div>
            `,
        };

        try {
            await sendEmail(mailOptions);
            logger.info('Warden appointment email sent', {
                wardenId: newWarden._id.toString(),
                wardenEmail: email,
            });
        } catch (emailError) {
            logger.error('Failed to send warden appointment email', {
                error: emailError.message,
                wardenId: newWarden._id.toString(),
                wardenEmail: email,
            });
            // Continue even if email fails - warden is still created
        }

        logger.info('Warden appointed', {
            wardenId: newWarden._id.toString(),
            wardenName: newWarden.name,
            wardenEmail: newWarden.email,
            hostel: newWarden.hostel,
            adminId: adminId.toString(),
        });

        return res.status(201).json({
            success: true,
            message: 'Warden appointed successfully',
            warden: {
                _id: newWarden._id,
                name: newWarden.name,
                email: newWarden.email,
                role: newWarden.role,
                hostel: newWarden.hostel,
            },
        });
    } catch (err) {
        logger.error('Failed to appoint warden', {
            error: err.message,
            email: email,
            adminId: adminId?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to appoint warden',
            error: err.message,
        });
    }
}


export async function listWardens(req, res) {
    try {
        const wardens = await User.find({ role: 'warden' })
            .select('_id name email role hostel createdAt')
            .sort({ hostel: 1, createdAt: -1 });

        logger.info('Wardens listed', {
            count: wardens.length,
            adminId: req.user._id.toString(),
        });

        return res.status(200).json({
            success: true,
            message: 'Wardens fetched successfully',
            wardens,
        });
    } catch (err) {
        logger.error('Failed to list wardens', {
            error: err.message,
            adminId: req.user._id?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to list wardens',
            error: err.message,
        });
    }
}

