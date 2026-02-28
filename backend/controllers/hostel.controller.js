import { z } from 'zod';
import Hostel from '../models/hostel.model.js';
import { logger } from '../middleware/logger.js';

const createHostelSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    capacity: z.number().int().positive().optional(),
});

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
