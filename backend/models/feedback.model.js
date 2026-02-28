import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    day: {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    mealType: {
      type: String,
      required: true,
      enum: [ "Breakfast", "Lunch", "Snacks", "Dinner" ],
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      index: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ collegeId: 1, messId: 1, date: 1, mealType: 1 });
feedbackSchema.index({ collegeId: 1, user: 1, date: 1 });

export default mongoose.model("Feedback", feedbackSchema);
