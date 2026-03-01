import { z } from "zod";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Hostel from "../models/hostel.model.js";
import Mess from "../models/mess.model.js";
import College from "../models/college.model.js";
import FeeSubmission from "../models/feeSubmission.model.js";
import { logger } from "../middleware/logger.js";

const studentRowSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .regex(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces"),
    rollNo: z
        .string()
        .regex(/^[0-9]{3}$/, "Roll number must be exactly 3 digits"),
    email: z.string().email("Invalid email format"),
    hostel: z.string().min(1, "Hostel name is required"),
    roomNo: z.string().min(1, "Room number is required"),
    mess: z.string().min(1, "Mess name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const bulkUploadSchema = z.object({
    students: z
        .array(studentRowSchema)
        .min(1, "At least one student is required")
        .max(200, "Maximum 200 students per upload"),
    mode: z.enum(["create", "upsert"]).optional().default("create"),
});

export async function bulkUploadStudents(req, res) {
    const { collegeId, role } = req.user;
    const isWarden = role === "warden";

    try {
        const parsed = bulkUploadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(parsed.error),
            });
        }

        const { students, mode } = parsed.data;

        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: "College not found",
            });
        }

        // Build lookup maps for hostels and messes
        const hostels = await Hostel.find({ collegeId });
        const hostelMap = new Map(hostels.map((h) => [h.name, h._id]));
        const hostelIdToName = new Map(hostels.map((h) => [h._id.toString(), h.name]));

        const messes = await Mess.find({ collegeId });
        const messMap = new Map(messes.map((m) => [m.name, m._id]));

        // For wardens, resolve their assigned hostel
        let wardenHostelId = null;
        let wardenHostelName = null;
        if (isWarden) {
            wardenHostelId = req.user.hostelId?.toString();
            wardenHostelName = wardenHostelId ? hostelIdToName.get(wardenHostelId) : null;
            if (!wardenHostelId) {
                return res.status(403).json({
                    success: false,
                    message: "Warden does not have an assigned hostel",
                });
            }
        }

        // Pre-fetch existing users by email and rollNo for duplicate/update detection
        const allEmails = students.map((s) => s.email.toLowerCase());
        const allRollNos = students.map((s) => s.rollNo);

        const existingUsersByEmail = await User.find({
            email: { $in: allEmails },
            collegeId,
        }).select("email rollNo name hostelId messId roomNo");
        const existingEmailMap = new Map(
            existingUsersByEmail.map((u) => [u.email, u])
        );

        const existingByRollNo = await User.find({
            rollNo: { $in: allRollNos },
            collegeId,
        }).select("rollNo email");
        const existingRollNoMap = new Map(
            existingByRollNo.map((u) => [u.rollNo, u])
        );

        const created = [];
        const updated = [];
        const skipped = [];
        const errors = [];

        for (let i = 0; i < students.length; i++) {
            const row = students[i];
            const rowNum = i + 1;
            const emailLower = row.email.toLowerCase();

            // Domain validation
            if (college.emailDomain && !emailLower.endsWith(college.emailDomain)) {
                errors.push({
                    row: rowNum,
                    email: emailLower,
                    reason: `Email domain must be ${college.emailDomain}`,
                });
                continue;
            }

            // Resolve hostel name
            const hostelId = hostelMap.get(row.hostel);
            if (!hostelId) {
                errors.push({
                    row: rowNum,
                    email: emailLower,
                    reason: `Hostel "${row.hostel}" not found. Available: ${[...hostelMap.keys()].join(", ")}`,
                });
                continue;
            }

            // Warden hostel restriction
            if (isWarden && hostelId.toString() !== wardenHostelId) {
                errors.push({
                    row: rowNum,
                    email: emailLower,
                    reason: `Wardens can only add/update students in their assigned hostel (${wardenHostelName})`,
                });
                continue;
            }

            // Resolve mess name
            const messId = messMap.get(row.mess);
            if (!messId) {
                errors.push({
                    row: rowNum,
                    email: emailLower,
                    reason: `Mess "${row.mess}" not found. Available: ${[...messMap.keys()].join(", ")}`,
                });
                continue;
            }

            const existingByEmail = existingEmailMap.get(emailLower);
            const existingByRoll = existingRollNoMap.get(row.rollNo);

            // Handle existing user by email
            if (existingByEmail) {
                if (mode === "upsert") {
                    // In upsert mode, update the existing user (don't touch password)
                    try {
                        const updateData = {
                            name: row.name.trim(),
                            hostelId,
                            messId,
                            roomNo: row.roomNo,
                        };

                        // If rollNo changed and new rollNo conflicts with another user, error
                        if (existingByEmail.rollNo !== row.rollNo && existingByRoll && existingByRoll.email !== emailLower) {
                            errors.push({
                                row: rowNum,
                                email: emailLower,
                                reason: `Roll number ${row.rollNo} is already assigned to another user (${existingByRoll.email})`,
                            });
                            continue;
                        }
                        updateData.rollNo = row.rollNo;

                        await User.findByIdAndUpdate(existingByEmail._id, { $set: updateData });

                        // Update FeeSubmission if name changed
                        if (existingByEmail.name !== row.name.trim()) {
                            await FeeSubmission.updateOne(
                                { studentId: existingByEmail._id },
                                { $set: { studentName: row.name.trim() } }
                            );
                        }

                        updated.push({
                            row: rowNum,
                            name: row.name.trim(),
                            email: emailLower,
                            rollNo: row.rollNo,
                        });
                    } catch (err) {
                        errors.push({
                            row: rowNum,
                            email: emailLower,
                            reason: `Update failed: ${err.message}`,
                        });
                    }
                } else {
                    skipped.push({
                        row: rowNum,
                        email: emailLower,
                        rollNo: row.rollNo,
                        reason: "Email already exists",
                    });
                }
                continue;
            }

            // Handle existing user by rollNo (different email)
            if (existingByRoll) {
                skipped.push({
                    row: rowNum,
                    email: emailLower,
                    rollNo: row.rollNo,
                    reason: "Roll number already exists",
                });
                continue;
            }

            // Create new user
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(row.password, salt);

                const newUser = await User.create({
                    name: row.name.trim(),
                    rollNo: row.rollNo,
                    email: emailLower,
                    hostelId,
                    messId,
                    roomNo: row.roomNo,
                    password: hashedPassword,
                    role: "student",
                    collegeId,
                });

                await FeeSubmission.create({
                    studentId: newUser._id,
                    studentName: newUser.name,
                    studentEmail: newUser.email,
                    collegeId,
                    hostelFee: { status: "documentNotSubmitted" },
                    messFee: { status: "documentNotSubmitted" },
                });

                // Track to catch in-batch duplicates
                existingEmailMap.set(emailLower, newUser);
                existingRollNoMap.set(row.rollNo, newUser);

                created.push({
                    row: rowNum,
                    name: newUser.name,
                    email: newUser.email,
                    rollNo: newUser.rollNo,
                });
            } catch (err) {
                if (err.code === 11000) {
                    skipped.push({
                        row: rowNum,
                        email: emailLower,
                        rollNo: row.rollNo,
                        reason: "Duplicate entry (email or roll number)",
                    });
                } else {
                    errors.push({
                        row: rowNum,
                        email: emailLower,
                        reason: err.message,
                    });
                }
            }
        }

        logger.info("Bulk upload completed", {
            userId: req.user._id.toString(),
            role,
            total: students.length,
            mode,
            created: created.length,
            updated: updated.length,
            skipped: skipped.length,
            errors: errors.length,
        });

        return res.status(200).json({
            success: true,
            message: `Bulk upload complete: ${created.length} created, ${updated.length} updated, ${skipped.length} skipped, ${errors.length} errors`,
            results: { created, updated, skipped, errors },
        });
    } catch (error) {
        logger.error("Bulk upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process bulk upload",
            error: error.message,
        });
    }
}
