import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "problem_created",
        "problem_status_updated",
        "announcement_created",
        "mess_feedback_submitted",
        "hostel_fee_submitted",
        "mess_fee_submitted",
        "fee_status_updated",
        "mess_menu_updated",
        "fee_submission_required",
        "contact_message_received",
        // Future types can be added here:
        // 'transit_request_approved',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    relatedEntityType: {
      type: String,
      enum: ["problem", "announcement", "fee", "transit", "mess", "contact"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries: get unread notifications for a user
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
