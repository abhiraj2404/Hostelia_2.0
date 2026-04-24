import { z } from 'zod';
import Hostel from '../models/hostel.model.js';
import User from '../models/user.model.js';
import Problem from '../models/problem.model.js';
import FeeSubmission from '../models/feeSubmission.model.js';
import Transit from '../models/transit.model.js';
import Feedback from '../models/feedback.model.js';
import Notification from '../models/notification.model.js';
import { logger } from '../middleware/logger.js';
import { invalidateCacheByPrefix } from '../middleware/cache.middleware.js';

const createHostelSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    capacity: z.number().int().positive().optional(),
});

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export async function createHostel(req, res) {
    const parsed = createHostelSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parsed.error),
        });
    }

    const { name, capacity } = parsed.data;
    const { collegeId, _id: adminId } = req.user;

    try {
        const existingHostel = await Hostel.findOne({ name, collegeId });
        if (existingHostel) {
            return res.status(400).json({
                success: false,
                message: `Hostel '${name}' already exists in your college.`,
            });
        }

        const newHostel = await Hostel.create({
            name,
            collegeId,
            capacity,
        });

        logger.info('Hostel created', {
            hostelId: newHostel._id.toString(),
            name,
            collegeId: collegeId.toString(),
            adminId: adminId.toString(),
        });
        await invalidateCacheByPrefix(`cache:hostel:list:${collegeId.toString()}:`);

        return res.status(201).json({
            success: true,
            message: 'Hostel created successfully',
            hostel: newHostel,
        });

    } catch (err) {
        logger.error('Failed to create hostel', {
            error: err.message,
            collegeId: collegeId?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to create hostel',
            error: err.message,
        });
    }
}

/**
 * List all hostels for the user's college, each with assigned wardens
 */
export async function listHostels(req, res) {
    try {
        const { collegeId } = req.user;

        const hostels = await Hostel.find({ collegeId }).sort({ name: 1 }).lean();

        // Fetch all wardens for this college and group by hostelId
        const wardens = await User.find({ role: 'warden', collegeId })
            .select('_id name email hostelId')
            .lean();

        const wardensByHostel = {};
        for (const w of wardens) {
            const hid = w.hostelId?.toString();
            if (!hid) continue;
            if (!wardensByHostel[ hid ]) wardensByHostel[ hid ] = [];
            wardensByHostel[ hid ].push({ _id: w._id, name: w.name, email: w.email });
        }

        const result = hostels.map((h) => ({
            ...h,
            wardens: wardensByHostel[ h._id.toString() ] || [],
        }));

        return res.status(200).json({
            success: true,
            hostels: result,
        });
    } catch (err) {
        logger.error('Failed to list hostels', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to list hostels',
            error: err.message,
        });
    }
}

/**
 * Delete a hostel and cascade delete related hostel data
 */
export async function deleteHostel(req, res) {
    const { id } = req.params;
    const { collegeId, _id: adminId } = req.user;

    try {
        const parsedId = objectIdSchema.safeParse(id);
        if (!parsedId.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parsedId.error),
            });
        }

        const hostel = await Hostel.findOne({ _id: parsedId.data, collegeId }).lean();
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found in your college',
            });
        }

        const session = await Hostel.startSession();

        let studentCount = 0;
        let wardenCount = 0;
        let problemCount = 0;
        let feeSubmissionCount = 0;
        let transitCount = 0;
        let feedbackCount = 0;
        let notificationCount = 0;

        try {
            const runCascadeDelete = async ({ useSession }) => {
                const userQuery = User.find({ collegeId, hostelId: hostel._id }).select('_id role');
                const usersInHostel = useSession ? await userQuery.session(session).lean() : await userQuery.lean();

                const userIds = usersInHostel.map((u) => u._id);
                studentCount = usersInHostel.filter((u) => u.role === 'student').length;
                wardenCount = usersInHostel.filter((u) => u.role === 'warden').length;

                const problemCountQuery = Problem.countDocuments({ collegeId, hostelId: hostel._id });
                const feeCountQuery = userIds.length > 0
                    ? FeeSubmission.countDocuments({ collegeId, studentId: { $in: userIds } })
                    : null;
                const transitCountQuery = userIds.length > 0
                    ? Transit.countDocuments({ collegeId, studentId: { $in: userIds } })
                    : null;
                const feedbackCountQuery = userIds.length > 0
                    ? Feedback.countDocuments({ collegeId, user: { $in: userIds } })
                    : null;
                const notificationCountQuery = userIds.length > 0
                    ? Notification.countDocuments({ collegeId, userId: { $in: userIds } })
                    : null;

                [
                    problemCount,
                    feeSubmissionCount,
                    transitCount,
                    feedbackCount,
                    notificationCount,
                ] = await Promise.all([
                    useSession ? problemCountQuery.session(session) : problemCountQuery,
                    feeCountQuery ? (useSession ? feeCountQuery.session(session) : feeCountQuery) : 0,
                    transitCountQuery ? (useSession ? transitCountQuery.session(session) : transitCountQuery) : 0,
                    feedbackCountQuery ? (useSession ? feedbackCountQuery.session(session) : feedbackCountQuery) : 0,
                    notificationCountQuery ? (useSession ? notificationCountQuery.session(session) : notificationCountQuery) : 0,
                ]);

                const deleteOpts = useSession ? { session } : undefined;

                await Promise.all([
                    Problem.deleteMany({ collegeId, hostelId: hostel._id }, deleteOpts),
                    userIds.length > 0
                        ? FeeSubmission.deleteMany({ collegeId, studentId: { $in: userIds } }, deleteOpts)
                        : Promise.resolve(),
                    userIds.length > 0
                        ? Transit.deleteMany({ collegeId, studentId: { $in: userIds } }, deleteOpts)
                        : Promise.resolve(),
                    userIds.length > 0
                        ? Feedback.deleteMany({ collegeId, user: { $in: userIds } }, deleteOpts)
                        : Promise.resolve(),
                    userIds.length > 0
                        ? Notification.deleteMany({ collegeId, userId: { $in: userIds } }, deleteOpts)
                        : Promise.resolve(),
                    userIds.length > 0
                        ? User.deleteMany({ collegeId, hostelId: hostel._id }, deleteOpts)
                        : Promise.resolve(),
                    Hostel.deleteOne({ _id: hostel._id, collegeId }, deleteOpts),
                ]);
            };

            try {
                await session.withTransaction(async () => {
                    await runCascadeDelete({ useSession: true });
                });
            } catch (txErr) {
                // Transactions require replica sets. In dev/test (e.g., mongodb-memory-server),
                // fall back to non-transactional deletes to keep behavior functional.
                const msg = txErr?.message || "";
                if (!/Transaction numbers are only allowed/i.test(msg)) {
                    throw txErr;
                }
                await runCascadeDelete({ useSession: false });
            }
        } finally {
            await session.endSession();
        }

        await invalidateCacheByPrefix(`cache:hostel:list:${collegeId.toString()}:`);

        logger.info('Hostel deleted with cascade cleanup', {
            hostelId: hostel._id.toString(),
            collegeId: collegeId.toString(),
            adminId: adminId.toString(),
            deleted: {
                hostels: 1,
                students: studentCount,
                wardens: wardenCount,
                problems: problemCount,
                feeSubmissions: feeSubmissionCount,
                transits: transitCount,
                feedbacks: feedbackCount,
                notifications: notificationCount,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Hostel and related data deleted successfully',
            deleted: {
                hostels: 1,
                students: studentCount,
                wardens: wardenCount,
                problems: problemCount,
                feeSubmissions: feeSubmissionCount,
                transits: transitCount,
                feedbacks: feedbackCount,
                notifications: notificationCount,
            },
        });
    } catch (err) {
        logger.error('Failed to delete hostel', {
            error: err.message,
            hostelId: id,
            collegeId: collegeId?.toString?.(),
            adminId: adminId?.toString?.(),
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to delete hostel',
            error: err.message,
        });
    }
}

