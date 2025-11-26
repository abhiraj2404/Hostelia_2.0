import { z } from "zod";
import { uploadBufferToCloudinary, getSecureUrl } from "../config/cloudinary.js";
import { logger } from "../middleware/logger.js";
import { isProblemInScope, scopedProblemsFilter } from "../middleware/roles.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import { notifyUsers } from "../utils/notificationService.js";

const createProblemSchema = z.object({
  problemTitle: z.string().min(3).max(200),
  problemDescription: z.string().min(3).max(5000),
  category: z.enum([
    "Electrical",
    "Plumbing",
    "Painting",
    "Carpentry",
    "Cleaning",
    "Internet",
    "Furniture",
    "Pest Control",
    "Other",
  ]),
  hostel: z.enum([ "BH-1", "BH-2", "BH-3", "BH-4" ]),
  roomNo: z.string().min(1),
});

export async function createProblem(req, res) {
  const parsed = createProblemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.treeifyError(parsed.error),
    });
  }

  const { _id: userId } = req.user;

  try {
    // Require image file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Problem image is required",
      });
    }

    // Upload image to Cloudinary if provided
    let problemImageUrl = undefined;
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `problems/${String(userId)}`,
      resource_type: "image",
      // optional: public_id could be derived from timestamp
    });
    problemImageUrl = getSecureUrl(uploadResult);
    if (!problemImageUrl) {
      return res
        .status(502)
        .json({ success: false, message: "Failed to upload image" });
    }

    const problem = await Problem.create({
      ...parsed.data,
      studentId: userId,
      problemImage: problemImageUrl,
    });
    logger.info("Problem created", {
      problemId: problem._id.toString(),
      problemTitle: parsed.data.problemTitle,
      studentId: userId.toString(),
    });

    // Notify admins and wardens about the new problem
    try {
      // Find all admins
      const admins = await User.find({ role: "admin" }).select("_id");
      const adminIds = admins.map((admin) => admin._id.toString());

      // Find wardens for the problem's hostel
      const wardens = await User.find({
        role: "warden",
        hostel: parsed.data.hostel,
      }).select("_id");
      const wardenIds = wardens.map((warden) => warden._id.toString());

      // Combine admin and warden IDs
      const notifyUserIds = [ ...adminIds, ...wardenIds ];

      if (notifyUserIds.length > 0) {
        await notifyUsers(notifyUserIds, {
          type: "problem_created",
          title: "New Problem Reported",
          message: `A new ${parsed.data.category} problem has been reported in ${parsed.data.hostel}, Room ${parsed.data.roomNo}: ${parsed.data.problemTitle}`,
          relatedEntityId: problem._id,
          relatedEntityType: "problem",
        });
        logger.info("Notifications sent for problem creation", {
          problemId: problem._id.toString(),
          notifiedUsers: notifyUserIds.length,
        });
      }
    } catch (notifError) {
      // Log error but don't fail the request
      logger.error("Failed to send notifications for problem creation", {
        error: notifError.message,
        problemId: problem._id.toString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem,
    });
  } catch (err) {
    logger.error("Failed to create problem", {
      error: err.message,
      userId: userId?.toString?.(),
    });
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create problem",
        error: err.message,
      });
  }
}

export async function listProblems(req, res) {
  const filter = scopedProblemsFilter(req);
  const { query, status, category, hostel } = req.query;

  try {
    // Apply additional filters from query params
    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    // Only admins can filter by hostel (students/wardens already scoped by scopedProblemsFilter)
    if (hostel && req.user.role === "admin") {
      filter.hostel = hostel;
    }

    // If there's a search query, search across multiple fields
    if (query && query.trim()) {
      const searchTerm = query.trim();

      // Try to find users by roll number or name
      const User = (await import("../models/user.model.js")).default;
      const userFilter = {
        $or: [
          { rollNo: { $regex: searchTerm, $options: "i" } },
          { name: { $regex: searchTerm, $options: "i" } },
        ],
      };

      const matchingUsers = await User.find(userFilter).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      // Search in problems by title, description, room number, or matching student IDs
      filter.$or = [
        { problemTitle: { $regex: searchTerm, $options: "i" } },
        { problemDescription: { $regex: searchTerm, $options: "i" } },
        { roomNo: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
      ];

      if (userIds.length > 0) {
        filter.$or.push({ studentId: { $in: userIds } });
      }
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, message: "Problems fetched", problems });
  } catch (err) {
    logger.error("Failed to list problems", { error: err.message, filter });
    return res.status(500).json({
      success: false,
      message: "Failed to list problems",
      error: err.message,
    });
  }
}

const commentSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export async function addProblemComment(req, res) {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten(),
    });
  }
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    if (!isProblemInScope(problem, req))
      return res.status(403).json({ success: false, message: "Forbidden" });

    problem.comments.push({
      user: req.user._id,
      role: req.user.role,
      message: parsed.data.message,
    });
    await problem.save();
    logger.info("Comment added to problem", {
      problemId: problem._id.toString(),
      userId: req.user._id.toString(),
    });
    return res
      .status(201)
      .json({ success: true, message: "Comment added", problem });
  } catch (err) {
    logger.error("Failed to add comment", {
      error: err.message,
      problemId: id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: err.message,
    });
  }
}

const statusSchema = z.object({
  status: z.enum([ "Pending", "Resolved", "Rejected", "ToBeConfirmed" ]),
});

export async function updateProblemStatus(req, res) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten(),
    });
  }
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });

    // Only warden/admin should call this; route will be gated. For safety, check scope for wardens
    if (req.user.role === "warden" && problem.hostel !== req.user.hostel) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const oldStatus = problem.status;
    problem.status = parsed.data.status;
    if (parsed.data.status === "Resolved" && !problem.resolvedAt) {
      problem.resolvedAt = new Date();
    }
    await problem.save();
    logger.info("Problem status updated", {
      problemId: problem._id.toString(),
      status: problem.status,
      actorId: req.user._id.toString(),
    });

    // Notify the student who created the problem about status update
    try {
      const studentId = problem.studentId.toString();
      const statusMessages = {
        Pending: "is pending review",
        Resolved: "has been resolved",
        Rejected: "has been rejected",
        ToBeConfirmed: "needs your confirmation",
      };
      const statusMessage =
        statusMessages[ parsed.data.status ] || "status has been updated";

      await notifyUsers([ studentId ], {
        type: "problem_status_updated",
        title: "Problem Status Updated",
        message: `Your problem "${problem.problemTitle}" ${statusMessage}.`,
        relatedEntityId: problem._id,
        relatedEntityType: "problem",
      });
      logger.info("Notification sent for problem status update", {
        problemId: problem._id.toString(),
        studentId,
        newStatus: parsed.data.status,
      });
    } catch (notifError) {
      // Log error but don't fail the request
      logger.error("Failed to send notification for problem status update", {
        error: notifError.message,
        problemId: problem._id.toString(),
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Status updated", problem });
  } catch (err) {
    logger.error("Failed to update status", {
      error: err.message,
      problemId: id,
    });
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update status",
        error: err.message,
      });
  }
}

const verifySchema = z.object({
  studentStatus: z.enum([ "NotResolved", "Resolved", "Rejected" ]),
});

export async function verifyProblemResolution(req, res) {
  // student verification endpoint
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten(),
    });
  }
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    if (String(problem.studentId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const studentStatus = parsed.data.studentStatus;
    problem.studentStatus = studentStatus;
    problem.studentVerifiedAt = new Date();

    // Update main status based on student verification
    if (studentStatus === "Resolved") {
      // Student confirms resolution
      problem.status = "Resolved";
    } else if (studentStatus === "Rejected") {
      // Student rejects resolution, reopen complaint
      problem.status = "Pending";
    }
    await problem.save();
    logger.info("Problem resolution verified by student", {
      problemId: problem._id.toString(),
      studentId: req.user._id.toString(),
      studentStatus: problem.studentStatus,
    });
    return res
      .status(200)
      .json({ success: true, message: "Verification updated", problem });
  } catch (err) {
    logger.error("Failed to verify problem", {
      error: err.message,
      problemId: id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify problem",
      error: err.message,
    });
  }
}
