import mongoose from "mongoose";

const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
const mealTypes = [ "Breakfast", "Lunch", "Snacks", "Dinner" ];

const mealArraySchema = {
    type: [
        {
            type: String,
            trim: true,
        },
    ],
    default: [],
};

const menuSchema = new mongoose.Schema(
    {
        day: { type: String, enum: days, required: true },
        hostel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            required: true,
            index: true
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College",
            required: true,
            index: true
        },
        meals: {
            Breakfast: mealArraySchema,
            Lunch: mealArraySchema,
            Snacks: mealArraySchema,
            Dinner: mealArraySchema,
        },
    },
    { timestamps: true }
);

// Compound index: Each hostel can only have one menu per day
menuSchema.index({ hostel: 1, day: 1 }, { unique: true });

export default mongoose.model("Menu", menuSchema);

