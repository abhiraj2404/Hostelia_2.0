import { z } from 'zod';
import User from '../models/user.model.js';
import FeeSubmission from '../models/feeSubmission.model.js';
import { logger } from '../middleware/logger.js';

const appointWardenSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
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

    const { userId } = parsed.data;
    const { _id: adminId } = req.user;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is already a warden
        if (user.role === 'warden') {
            return res.status(400).json({
                success: false,
                message: 'User is already a warden',
            });
        }

        // Check if user is a student
        if (user.role !== 'student') {
            return res.status(400).json({
                success: false,
                message: 'Only students can be appointed as wardens',
            });
        }

        // Verify user has a hostel assigned
        if (!user.hostel) {
            return res.status(400).json({
                success: false,
                message: 'User must have a hostel assigned to be appointed as warden',
            });
        }

        // Check if hostel already has 2 wardens
        const wardenCount = await User.countDocuments({
            role: 'warden',
            hostel: user.hostel,
        });

        if (wardenCount >= 2) {
            return res.status(400).json({
                success: false,
                message: `Hostel ${user.hostel} already has 2 wardens. Maximum 2 wardens allowed per hostel.`,
            });
        }

        // Update user: set role to warden, clear roomNo, rollNo, year
        user.role = 'warden';
        user.roomNo = undefined;
        user.rollNo = undefined;
        user.year = undefined;
        await user.save();

        // Delete FeeSubmission entry if exists
        await FeeSubmission.findOneAndDelete({ studentId: userId });

        logger.info('Warden appointed', {
            wardenId: user._id.toString(),
            wardenName: user.name,
            hostel: user.hostel,
            adminId: adminId.toString(),
        });

        return res.status(200).json({
            success: true,
            message: 'Warden appointed successfully',
            warden: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostel: user.hostel,
            },
        });
    } catch (err) {
        logger.error('Failed to appoint warden', {
            error: err.message,
            userId: userId,
            adminId: adminId?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to appoint warden',
            error: err.message,
        });
    }
}

const removeWardenSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export async function removeWarden(req, res) {
    const parsed = removeWardenSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parsed.error),
        });
    }

    const { userId } = parsed.data;
    const { _id: adminId } = req.user;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is a warden
        if (user.role !== 'warden') {
            return res.status(400).json({
                success: false,
                message: 'User is not a warden',
            });
        }

        // Check if user has a hostel assigned
        if (!user.hostel) {
            return res.status(400).json({
                success: false,
                message: 'Warden does not have a hostel assigned',
            });
        }

        // Count wardens for that hostel
        const wardenCount = await User.countDocuments({
            role: 'warden',
            hostel: user.hostel,
        });

        // If count would be 0 after deletion, return error
        if (wardenCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove warden. Hostel must have at least one warden. Please appoint another warden first.',
            });
        }

        // Update user: set role to student, keep existing hostel
        user.role = 'student';
        await user.save();

        // Do NOT create FeeSubmission entry (as per requirements)

        logger.info('Warden removed', {
            formerWardenId: user._id.toString(),
            formerWardenName: user.name,
            hostel: user.hostel,
            adminId: adminId.toString(),
        });

        return res.status(200).json({
            success: true,
            message: 'Warden removed successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostel: user.hostel,
            },
        });
    } catch (err) {
        logger.error('Failed to remove warden', {
            error: err.message,
            userId: userId,
            adminId: adminId?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to remove warden',
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

