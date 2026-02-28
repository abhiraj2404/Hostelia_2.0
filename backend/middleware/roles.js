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
    const collegeId = req.user?.collegeId;
    if (role === 'student') {
        return { studentId: req.user._id, collegeId };
    }
    if (role === 'warden') {
        return { hostelId: req.user.hostelId, collegeId };
    }
    // collegeAdmin sees all within their college
    return { collegeId };
}

// Optional helper to verify a single problem is within the requester scope
export function isProblemInScope(problemDoc, req) {
    const role = req.user?.role;
    if (role === 'collegeAdmin') return true;
    if (role === 'student') return String(problemDoc.studentId) === String(req.user._id);
    if (role === 'warden') return problemDoc.hostelId?.toString() === req.user.hostelId?.toString();
    return false;
}

// Compute MongoDB filters for FeeSubmissions based on the requester role
export async function scopedFeeFilter(req) {
    const role = req.user?.role;
    const collegeId = req.user?.collegeId;
    if (role === 'student') {
        return { studentId: req.user._id, collegeId };
    }

    if (role === 'warden') {
        if (!req.user?.hostelId) {
            logger.warn('scopedFeeFilter: warden missing hostel assignment', {
                userId: req.user?._id,
            });
            return { studentId: { $in: [] } };
        }

        const studentIds = await User.find({
            role: 'student',
            hostelId: req.user.hostelId,
            collegeId,
        }).distinct('_id');

        return { studentId: { $in: studentIds }, collegeId };
    }

    // collegeAdmin sees all within their college
    return { collegeId };
}

