import mongoose from "mongoose";

const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

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
        messId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mess",
            required: true,
            index: true,
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College",
            required: true,
            index: true,
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

// Each mess can only have one menu entry per day
menuSchema.index({ messId: 1, day: 1 }, { unique: true });

export default mongoose.model("Menu", menuSchema);
