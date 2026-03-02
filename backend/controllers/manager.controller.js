import bcrypt from 'bcrypt';
import { z } from 'zod';
import { logger } from '../middleware/logger.js';
import College from '../models/college.model.js';
import Hostel from '../models/hostel.model.js';
import Mess from '../models/mess.model.js';
import User from '../models/user.model.js';
import { sendEmail, getEmailUser } from '../utils/email-client.js';

/**
 * Get platform-wide dashboard stats for the manager
 */
export async function getDashboardStats(req, res) {
    try {
        // Aggregate counts
        const [ totalColleges, approvedColleges, pendingColleges, rejectedColleges, totalUsers, totalHostels, totalMesses ] =
            await Promise.all([
                College.countDocuments({}),
                College.countDocuments({ $or: [ { status: 'approved' }, { status: { $exists: false } } ] }),
                College.countDocuments({ status: 'pending' }),
                College.countDocuments({ status: 'rejected' }),
                User.countDocuments({ role: { $ne: 'manager' } }),
                Hostel.countDocuments({}),
                Mess.countDocuments({}),
            ]);

        // Monthly signups (colleges) — last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const collegeSignups = await College.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Monthly user signups — last 6 months
        const userSignups = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, role: { $ne: 'manager' } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Build month labels for last 6 months
        const monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
        const months = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: monthNames[ d.getMonth() ] });
        }

        const collegeTrend = months.map((m) => {
            const found = collegeSignups.find((s) => s._id.year === m.year && s._id.month === m.month);
            return { month: m.label, colleges: found ? found.count : 0 };
        });

        const userTrend = months.map((m) => {
            const found = userSignups.find((s) => s._id.year === m.year && s._id.month === m.month);
            return { month: m.label, users: found ? found.count : 0 };
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalColleges,
                approvedColleges,
                pendingColleges,
                rejectedColleges,
                totalUsers,
                totalHostels,
                totalMesses,
            },
            collegeTrend,
            userTrend,
        });
    } catch (err) {
        logger.error('Failed to get dashboard stats', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats',
            error: err.message,
        });
    }
}
export async function listAllColleges(req, res) {
    try {
        const colleges = await College.find({}).sort({ createdAt: -1 }).lean();

        // Get counts for each college in parallel
        const collegeIds = colleges.map((c) => c._id);

        const [ hostelCounts, messCounts, userCounts ] = await Promise.all([
            Hostel.aggregate([
                { $match: { collegeId: { $in: collegeIds } } },
                { $group: { _id: '$collegeId', count: { $sum: 1 } } },
            ]),
            Mess.aggregate([
                { $match: { collegeId: { $in: collegeIds } } },
                { $group: { _id: '$collegeId', count: { $sum: 1 } } },
            ]),
            User.aggregate([
                { $match: { collegeId: { $in: collegeIds } } },
                { $group: { _id: '$collegeId', count: { $sum: 1 } } },
            ]),
        ]);

        // Build lookup maps
        const hostelMap = Object.fromEntries(hostelCounts.map((h) => [ h._id.toString(), h.count ]));
        const messMap = Object.fromEntries(messCounts.map((m) => [ m._id.toString(), m.count ]));
        const userMap = Object.fromEntries(userCounts.map((u) => [ u._id.toString(), u.count ]));

        const result = colleges.map((c) => ({
            ...c,
            hostelsCount: hostelMap[ c._id.toString() ] || 0,
            messesCount: messMap[ c._id.toString() ] || 0,
            usersCount: userMap[ c._id.toString() ] || 0,
        }));

        return res.status(200).json({
            success: true,
            colleges: result,
        });
    } catch (err) {
        logger.error('Failed to list all colleges', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to list colleges',
            error: err.message,
        });
    }
}

/**
 * Get pending college registrations
 */
export async function getPendingColleges(req, res) {
    try {
        const colleges = await College.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({
            success: true,
            colleges,
        });
    } catch (err) {
        logger.error('Failed to list pending colleges', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to list pending colleges',
            error: err.message,
        });
    }
}

const approveSchema = z.object({
    collegeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid college ID'),
});

/**
 * Approve a pending college registration.
 * Creates the admin user with an auto-generated password and sends credentials via email.
 */
export async function approveCollege(req, res) {
    try {
        const parsed = approveSchema.safeParse({ collegeId: req.params.id });
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parsed.error),
            });
        }

        const college = await College.findById(parsed.data.collegeId);
        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        if (college.status === 'approved') {
            return res.status(400).json({ success: false, message: 'College is already approved' });
        }

        // Generate a random password for the admin
        const plainPassword =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-4);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Create the admin user
        await User.create({
            name: 'College Admin',
            email: college.adminEmail,
            password: hashedPassword,
            role: 'collegeAdmin',
            collegeId: college._id,
        });

        // Update college status
        college.status = 'approved';
        await college.save();

        // Send credentials email
        const mailOptions = {
            from: `"Hostelia Platform" <${getEmailUser()}>`,
            to: college.adminEmail,
            subject: 'Welcome to Hostelia - Your College Registration is Approved!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
                    <h2 style="color: #4f46e5;">Welcome to Hostelia!</h2>
                    <p>Dear ${college.name} Administrator,</p>
                    <p>Great news! Your college registration has been approved.</p>
                    <p>Here are your admin login credentials:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Email:</strong> ${college.adminEmail}</p>
                        <p><strong>Password:</strong> <span style="font-family: monospace;">${plainPassword}</span></p>
                    </div>
                    <p style="color: #ef4444;"><strong>Important:</strong> Please log in and change your password immediately.</p>
                    <p>Best regards,<br>Hostelia Team</p>
                </div>
            `,
        };

        try {
            await sendEmail(mailOptions);
            logger.info('Approval email sent', { collegeId: college._id.toString(), adminEmail: college.adminEmail });
        } catch (emailError) {
            logger.error('Failed to send approval email', { error: emailError.message, collegeId: college._id.toString() });
            // Continue — college is approved even if email fails
        }

        logger.info('College approved', {
            collegeId: college._id.toString(),
            approvedBy: req.user._id.toString(),
        });

        return res.status(200).json({
            success: true,
            message: 'College approved successfully. Login credentials sent to the admin email.',
            college: {
                id: college._id,
                name: college.name,
                status: 'approved',
            },
        });
    } catch (err) {
        logger.error('Failed to approve college', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to approve college',
            error: err.message,
        });
    }
}

/**
 * Reject a pending college registration
 */
export async function rejectCollege(req, res) {
    try {
        const parsed = approveSchema.safeParse({ collegeId: req.params.id });
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parsed.error),
            });
        }

        const college = await College.findById(parsed.data.collegeId);
        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        if (college.status === 'rejected') {
            return res.status(400).json({ success: false, message: 'College is already rejected' });
        }

        college.status = 'rejected';
        await college.save();

        // Clean up: delete hostels, messes, and the college document
        await Promise.all([
            Hostel.deleteMany({ collegeId: college._id }),
            Mess.deleteMany({ collegeId: college._id }),
        ]);
        await College.findByIdAndDelete(college._id);

        // Send rejection email
        const mailOptions = {
            from: `"Hostelia Platform" <${getEmailUser()}>`,
            to: college.adminEmail,
            subject: 'Hostelia - College Registration Update',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
                    <h2 style="color: #ef4444;">Registration Update</h2>
                    <p>Dear ${college.name} Administrator,</p>
                    <p>We regret to inform you that your college registration on Hostelia has not been approved at this time.</p>
                    <p>If you believe this is an error, please contact our support team.</p>
                    <p>Best regards,<br>Hostelia Team</p>
                </div>
            `,
        };

        try {
            await sendEmail(mailOptions);
        } catch (emailError) {
            logger.error('Failed to send rejection email', { error: emailError.message });
        }

        logger.info('College rejected', {
            collegeId: college._id.toString(),
            rejectedBy: req.user._id.toString(),
        });

        return res.status(200).json({
            success: true,
            message: 'College registration rejected.',
            college: {
                id: college._id,
                name: college.name,
                status: 'rejected',
            },
        });
    } catch (err) {
        logger.error('Failed to reject college', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to reject college',
            error: err.message,
        });
    }
}
