import { z } from "zod";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { logger } from "../middleware/logger.js";
import { scopedFeeFilter } from "../middleware/roles.js";
import FeeSubmission from "../models/feeSubmission.model.js";
import User from "../models/user.model.js";
import { getEmailUser, sendEmail } from "../utils/email-client.js";
import { notifyUsers } from "../utils/notificationService.js";

// Get fee status - role-based (student sees own, admin sees all)
export async function getFeeStatus(req, res) {
  try {
    const filter = scopedFeeFilter(req);
    const feeSubmissions = await FeeSubmission.find(filter).sort({
      createdAt: -1,
    });
    logger.info("Fee status fetched", {
      role: req.user.role,
      count: feeSubmissions.length,
    });
    return res.status(200).json({
      success: true,
      message: "Fee status fetched successfully",
      data: feeSubmissions,
    });
  } catch (err) {
    logger.error("Failed to fetch fee status", {
      error: err.message,
      role: req.user?.role,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee status",
      error: err.message,
    });
  }
}

// Submit hostel fee document
export async function submitHostelFee(req, res) {
  const { _id: userId } = req.user;

  try {
    // Require file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Fee document is required",
      });
    }

    // Upload document to Cloudinary
    // Use "raw" resource_type for PDFs, "auto" for images
    const mimetype = (req.file.mimetype || "").toLowerCase();
    const isPdf = mimetype === "application/pdf" || mimetype.includes("pdf");
    const resourceType = isPdf ? "raw" : "auto";

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `fees/${String(userId)}/hostel`,
      resource_type: resourceType,
    });

    const documentUrl = uploadResult?.url || uploadResult?.secure_url;
    if (!documentUrl) {
      return res.status(502).json({
        success: false,
        message: "Failed to upload document",
      });
    }

    // Update FeeSubmission - entry should already exist from signup
    const feeSubmission = await FeeSubmission.findOneAndUpdate(
      { studentId: userId },
      {
        "hostelFee.documentUrl": documentUrl,
        "hostelFee.status": "pending",
      },
      {
        new: true,
      }
    );

    if (!feeSubmission) {
      return res.status(404).json({
        success: false,
        message: "Fee submission entry not found. Please contact admin.",
      });
    }

    logger.info("Hostel fee document submitted", {
      studentId: userId.toString(),
      feeSubmissionId: feeSubmission._id.toString(),
    });

    // Notify admins about hostel fee submission
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const adminIds = admins.map((admin) => admin._id.toString());

      if (adminIds.length > 0) {
        await notifyUsers(adminIds, {
          type: "hostel_fee_submitted",
          title: "Hostel Fee Submitted",
          message: `${req.user.name} submitted hostel fee documents for review.`,
          relatedEntityId: feeSubmission._id,
          relatedEntityType: "fee",
        });
        logger.info("Notifications sent for hostel fee submission", {
          feeSubmissionId: feeSubmission._id.toString(),
          notifiedUsers: adminIds.length,
        });
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for hostel fee submission", {
        error: notifError.message,
        feeSubmissionId: feeSubmission._id.toString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Hostel fee document submitted successfully",
      data: feeSubmission,
    });
  } catch (err) {
    logger.error("Failed to submit hostel fee", {
      error: err.message,
      userId: userId?.toString?.(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to submit hostel fee",
      error: err.message,
    });
  }
}

// Submit mess fee document
export async function submitMessFee(req, res) {
  const { _id: userId, name, email } = req.user;

  try {
    // Require file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Fee document is required",
      });
    }

    // Upload document to Cloudinary
    // Use "raw" resource_type for PDFs, "auto" for images
    const mimetype = (req.file.mimetype || "").toLowerCase();
    const isPdf = mimetype === "application/pdf" || mimetype.includes("pdf");
    const resourceType = isPdf ? "raw" : "auto";

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `fees/${String(userId)}/mess`,
      resource_type: resourceType,
    });

    const documentUrl = uploadResult?.url || uploadResult?.secure_url;
    if (!documentUrl) {
      return res.status(502).json({
        success: false,
        message: "Failed to upload document",
      });
    }

    // Update FeeSubmission - entry should already exist from signup
    const feeSubmission = await FeeSubmission.findOneAndUpdate(
      { studentId: userId },
      {
        "messFee.documentUrl": documentUrl,
        "messFee.status": "pending",
      },
      {
        new: true,
      }
    );

    if (!feeSubmission) {
      return res.status(404).json({
        success: false,
        message: "Fee submission entry not found. Please contact admin.",
      });
    }

    logger.info("Mess fee document submitted", {
      studentId: userId.toString(),
      feeSubmissionId: feeSubmission._id.toString(),
    });

    // Notify admins about mess fee submission
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const adminIds = admins.map((admin) => admin._id.toString());

      if (adminIds.length > 0) {
        await notifyUsers(adminIds, {
          type: "mess_fee_submitted",
          title: "Mess Fee Submitted",
          message: `${req.user.name} submitted mess fee documents for review.`,
          relatedEntityId: feeSubmission._id,
          relatedEntityType: "fee",
        });
        logger.info("Notifications sent for mess fee submission", {
          feeSubmissionId: feeSubmission._id.toString(),
          notifiedUsers: adminIds.length,
        });
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for mess fee submission", {
        error: notifError.message,
        feeSubmissionId: feeSubmission._id.toString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Mess fee document submitted successfully",
      data: feeSubmission,
    });
  } catch (err) {
    logger.error("Failed to submit mess fee", {
      error: err.message,
      userId: userId?.toString?.(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to submit mess fee",
      error: err.message,
    });
  }
}

// Update fee status (admin only)
const updateFeeStatusSchema = z.object({
  hostelFeeStatus: z
    .enum(["documentNotSubmitted", "pending", "approved", "rejected"])
    .optional(),
  messFeeStatus: z
    .enum(["documentNotSubmitted", "pending", "approved", "rejected"])
    .optional(),
});

export async function updateFeeStatus(req, res) {
  const parsed = updateFeeStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.treeifyError(parsed.error),
    });
  }

  const { studentId } = req.params;
  const { hostelFeeStatus, messFeeStatus } = parsed.data;

  try {
    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Build update object
    const updateFields = {};
    if (hostelFeeStatus !== undefined) {
      updateFields["hostelFee.status"] = hostelFeeStatus;
    }
    if (messFeeStatus !== undefined) {
      updateFields["messFee.status"] = messFeeStatus;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one fee status must be provided",
      });
    }

    // Update FeeSubmission
    const feeSubmission = await FeeSubmission.findOneAndUpdate(
      { studentId },
      updateFields,
      { new: true, upsert: false }
    );

    if (!feeSubmission) {
      return res.status(404).json({
        success: false,
        message: "Fee submission not found for this student",
      });
    }

    logger.info("Fee status updated", {
      studentId: studentId.toString(),
      hostelFeeStatus,
      messFeeStatus,
      actorId: req.user._id.toString(),
    });

    // Notify student about fee status updates
    try {
      const updates = [];
      if (hostelFeeStatus !== undefined) {
        updates.push(`Hostel fee status: ${hostelFeeStatus}`);
      }
      if (messFeeStatus !== undefined) {
        updates.push(`Mess fee status: ${messFeeStatus}`);
      }

      const message =
        updates.length > 0
          ? updates.join(" | ")
          : "Your fee status has been updated.";

      await notifyUsers([studentId], {
        type: "fee_status_updated",
        title: "Fee Status Updated",
        message,
        relatedEntityId: feeSubmission._id,
        relatedEntityType: "fee",
      });
      logger.info("Notification sent for fee status update", {
        studentId: studentId.toString(),
        feeSubmissionId: feeSubmission._id.toString(),
      });
    } catch (notifError) {
      logger.error("Failed to send notification for fee status update", {
        error: notifError.message,
        studentId: studentId.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fee status updated successfully",
      data: feeSubmission,
    });
  } catch (err) {
    logger.error("Failed to update fee status", {
      error: err.message,
      studentId,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update fee status",
      error: err.message,
    });
  }
}

// Send single fee reminder
const sendFeeReminderSchema = z.object({
  studentId: z.string().min(1),
  emailType: z.enum(["hostelFee", "messFee", "both"]),
  notes: z.string().optional(),
});

export async function sendFeeReminder(req, res) {
  const parsed = sendFeeReminderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.treeifyError(parsed.error),
    });
  }

  const { studentId, emailType, notes } = parsed.data;

  try {
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const sender = req.user;

    let emailSubject, emailContent;

    if (emailType === "hostelFee" || emailType === "both") {
      emailSubject = "Reminder: Hostel Fee Payment Due";
      emailContent = `<p>Dear ${
        student.name
      },</p><p>This is a friendly reminder that your hostel fee payment is due. Please make the payment as soon as possible to avoid any inconvenience.</p>${
        notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
      }<p>If you have already made the payment, please ignore this email.</p><p>Best regards,<br>${
        sender.name
      }<br>${sender.role.charAt(0).toUpperCase() + sender.role.slice(1)}</p>`;
    }

    if (emailType === "messFee" || emailType === "both") {
      if (emailSubject) {
        emailSubject = "Reminder: Hostel and Mess Fee Payments Due";
        emailContent = `<p>Dear ${
          student.name
        },</p><p>This is a friendly reminder that your hostel and mess fee payments are due. Please make the payments as soon as possible to avoid any inconvenience.</p>${
          notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
        }<p>If you have already made the payments, please ignore this email.</p><p>Best regards,<br>${
          sender.name
        }<br>${sender.role.charAt(0).toUpperCase() + sender.role.slice(1)}</p>`;
      } else {
        emailSubject = "Reminder: Mess Fee Payment Due";
        emailContent = `<p>Dear ${
          student.name
        },</p><p>This is a friendly reminder that your mess fee payment is due. Please make the payment as soon as possible to avoid any inconvenience.</p>${
          notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
        }<p>If you have already made the payment, please ignore this email.</p><p>Best regards,<br>${
          sender.name
        }<br>${sender.role.charAt(0).toUpperCase() + sender.role.slice(1)}</p>`;
      }
    }

    const mailOptions = {
      from: `"Hostelia - ${sender.name}" <${getEmailUser()}>`,
      to: student.email,
      subject: emailSubject,
      html: emailContent,
    };

    // Send email and create in-app notification
    let emailSent = false;
    let notificationSent = false;
    let emailInfo = null;
    let emailError = null;
    let notificationError = null;

    // Attempt to send email
    try {
      emailInfo = await sendEmail(mailOptions, { debug: true });
      emailSent = true;
      logger.info("Fee reminder email sent", {
        studentId: studentId.toString(),
        studentEmail: student.email,
        emailType,
        messageId: emailInfo.messageId,
        senderId: req.user._id.toString(),
      });
    } catch (emailErr) {
      emailError = emailErr.message;
      logger.error("Failed to send fee reminder email", {
        error: emailErr.message,
        studentId: studentId.toString(),
        studentEmail: student.email,
      });
    }

    // Attempt to create in-app notification (regardless of email success)
    try {
      // Get fee submission for the student to use as relatedEntityId
      const feeSubmission = await FeeSubmission.findOne({ studentId });

      if (feeSubmission) {
        const feeTypeMessage =
          emailType === "hostelFee"
            ? "hostel fee"
            : emailType === "messFee"
            ? "mess fee"
            : "hostel and mess fees";

        await notifyUsers([studentId], {
          type: "fee_submission_required",
          title: "Fee Payment Reminder",
          message: `You have been reminded to submit your ${feeTypeMessage} payment document.${
            notes ? ` Note: ${notes}` : ""
          }`,
          relatedEntityId: feeSubmission._id,
          relatedEntityType: "fee",
        });

        notificationSent = true;
        logger.info("Notification created for fee reminder", {
          studentId: studentId.toString(),
          feeSubmissionId: feeSubmission._id.toString(),
        });
      } else {
        notificationError = "Fee submission not found for student";
        logger.warn("Fee submission not found for notification", {
          studentId: studentId.toString(),
        });
      }
    } catch (notifErr) {
      notificationError = notifErr.message;
      logger.error("Failed to create notification for fee reminder", {
        error: notifErr.message,
        studentId: studentId.toString(),
      });
    }

    // Return appropriate response based on what succeeded
    if (emailSent && notificationSent) {
      return res.status(200).json({
        success: true,
        message: `Fee reminder sent to ${student.name} (email and notification)`,
        email: student.email,
        messageId: emailInfo?.messageId,
        emailSent: true,
        notificationSent: true,
      });
    } else if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `Fee reminder email sent to ${student.name}, but notification failed`,
        email: student.email,
        messageId: emailInfo?.messageId,
        emailSent: true,
        notificationSent: false,
        notificationError: notificationError,
      });
    } else if (notificationSent) {
      return res.status(200).json({
        success: true,
        message: `Fee reminder notification sent to ${student.name}, but email failed`,
        email: student.email,
        emailSent: false,
        notificationSent: true,
        emailError: emailError,
      });
    } else {
      // Both failed
      return res.status(500).json({
        success: false,
        message: `Failed to send fee reminder to ${student.name}`,
        emailError: emailError,
        notificationError: notificationError,
      });
    }
  } catch (error) {
    logger.error("Error sending fee reminder email", {
      error: error.message,
      studentId,
    });
    return res.status(500).json({
      success: false,
      message: "Error sending email: " + error.message,
    });
  }
}

// Send bulk fee reminders
const sendBulkFeeRemindersSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  emailType: z.enum(["hostelFee", "messFee", "both"]),
  notes: z.string().optional(),
});

export async function sendBulkFeeReminders(req, res) {
  const parsed = sendBulkFeeRemindersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.treeifyError(parsed.error),
    });
  }

  const { studentIds, emailType, notes } = parsed.data;

  try {
    const sender = req.user;

    const students = await User.find({ _id: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }

    const results = { success: [], failed: [] };

    for (const student of students) {
      try {
        let emailSubject, emailContent;

        if (emailType === "hostelFee" || emailType === "both") {
          emailSubject = "Reminder: Hostel Fee Payment Due";
          emailContent = `<p>Dear ${
            student.name
          },</p><p>This is a friendly reminder that your hostel fee payment is due. Please make the payment as soon as possible to avoid any inconvenience.</p>${
            notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
          }<p>If you have already made the payment, please ignore this email.</p><p>Best regards,<br>${
            sender.name
          }<br>${
            sender.role.charAt(0).toUpperCase() + sender.role.slice(1)
          }</p>`;
        }

        if (emailType === "messFee" || emailType === "both") {
          if (emailSubject) {
            emailSubject = "Reminder: Hostel and Mess Fee Payments Due";
            emailContent = `<p>Dear ${
              student.name
            },</p><p>This is a friendly reminder that your hostel and mess fee payments are due. Please make the payments as soon as possible to avoid any inconvenience.</p>${
              notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
            }<p>If you have already made the payments, please ignore this email.</p><p>Best regards,<br>${
              sender.name
            }<br>${
              sender.role.charAt(0).toUpperCase() + sender.role.slice(1)
            }</p>`;
          } else {
            emailSubject = "Reminder: Mess Fee Payment Due";
            emailContent = `<p>Dear ${
              student.name
            },</p><p>This is a friendly reminder that your mess fee payment is due. Please make the payment as soon as possible to avoid any inconvenience.</p>${
              notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""
            }<p>If you have already made the payment, please ignore this email.</p><p>Best regards,<br>${
              sender.name
            }<br>${
              sender.role.charAt(0).toUpperCase() + sender.role.slice(1)
            }</p>`;
          }
        }

        const mailOptions = {
          from: `"Hostelia - ${sender.name}" <${getEmailUser()}>`,
          to: student.email,
          subject: emailSubject,
          html: emailContent,
        };

        const info = await sendEmail(mailOptions, { debug: true });

        results.success.push({
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          messageId: info.messageId,
        });
      } catch (error) {
        results.failed.push({
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          error: error.message,
        });
      }
    }

    logger.info("Bulk fee reminders sent", {
      total: students.length,
      success: results.success.length,
      failed: results.failed.length,
      emailType,
      senderId: req.user._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: `Sent ${results.success.length} emails, failed to send ${results.failed.length} emails`,
      results,
    });
  } catch (error) {
    logger.error("Error sending bulk fee reminders", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: "Error sending bulk fee reminders",
      error: error.message,
    });
  }
}
