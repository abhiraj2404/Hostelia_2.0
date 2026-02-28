import mongoose from "mongoose";

const messSchema = new mongoose.Schema(
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
        },
        capacity: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure mess names are unique within a college
messSchema.index({ name: 1, collegeId: 1 }, { unique: true });

export default mongoose.model("Mess", messSchema);
