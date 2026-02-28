import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College",
            required: true,
            index: true,
        },
        capacity: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: hostel names should be unique within a college
hostelSchema.index({ name: 1, collegeId: 1 }, { unique: true });

export default mongoose.model("Hostel", hostelSchema);
