// Role-based authorization and scoping helpers
import { logger } from './logger.js';
import User from "../models/user.model.js";

export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            logger.warn('AuthorizeRoles: unauthorized access attempt');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('AuthorizeRoles: forbidden role', { role: req.user.role, route: req.originalUrl });
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        next();
    };
}

// Compute MongoDB filters for Problems based on the requester role
export function scopedProblemsFilter(req) {
    const role = req.user?.role;
    if (role === 'student') {
        return { studentId: req.user._id };
    }
    if (role === 'warden') {
        return { hostel: req.user.hostel };
    }
    // admin (or any higher role) sees all
    return {};
}

// Optional helper to verify a single problem is within the requester scope
export function isProblemInScope(problemDoc, req) {
    const role = req.user?.role;
    if (role === 'admin') return true;
    if (role === 'student') return String(problemDoc.studentId) === String(req.user._id);
    if (role === 'warden') return problemDoc.hostel === req.user.hostel;
    return false;
}

// Compute MongoDB filters for FeeSubmissions based on the requester role
export async function scopedFeeFilter(req) {
    const role = req.user?.role;
    if (role === 'student') {
        return { studentId: req.user._id };
    }

    if (role === 'warden') {
        if (!req.user?.hostel) {
            logger.warn('scopedFeeFilter: warden missing hostel assignment', {
                userId: req.user?._id,
            });
            return { studentId: { $in: [] } };
        }

        const studentIds = await User.find({
            role: 'student',
            hostel: req.user.hostel,
        }).distinct('_id');

        return { studentId: { $in: studentIds } };
    }

    // admin (or any higher role) sees all
    return {};
}

