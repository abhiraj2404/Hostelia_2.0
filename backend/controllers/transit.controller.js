import { z } from 'zod';
import Transit from '../models/transit.model.js';
import { logger } from '../middleware/logger.js';

const createTransitSchema = z.object({
    purpose: z.string().min(3).max(500),
    transitStatus: z.enum([ 'ENTRY', 'EXIT' ]),
    date: z.coerce.date().optional(),
    time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Time must be in HH:MM:SS format').optional(),
});

export async function createTransitEntry(req, res) {
    const parsed = createTransitSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parsed.error),
        });
    }

    const { _id: userId } = req.user;

    try {
        const transitData = {
            studentId: userId,
            purpose: parsed.data.purpose,
            transitStatus: parsed.data.transitStatus,
            date: parsed.data.date || new Date(),
            time: parsed.data.time || new Date().toTimeString().split(' ')[ 0 ],
        };

        const transit = await Transit.create(transitData);
        logger.info('Transit entry created', {
            transitId: transit._id.toString(),
            transitStatus: parsed.data.transitStatus,
            studentId: userId.toString()
        });
        return res.status(201).json({
            success: true,
            message: 'Transit entry created successfully',
            transit,
        });
    } catch (err) {
        logger.error('Failed to create transit entry', { error: err.message, userId: userId?.toString?.() });
        return res.status(500).json({
            success: false,
            message: 'Failed to create transit entry',
            error: err.message
        });
    }
}

export async function listTransitEntries(req, res) {
    try {
        const transitEntries = await Transit.find({})
            .populate('studentId', 'name rollNo hostel roomNo')
            .sort({ createdAt: -1 });
        logger.info('Transit entries fetched', { count: transitEntries.length });
        return res.status(200).json({
            success: true,
            message: 'Transit entries fetched',
            transitEntries
        });
    } catch (err) {
        logger.error('Failed to list transit entries', { error: err.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to list transit entries',
            error: err.message
        });
    }
}

