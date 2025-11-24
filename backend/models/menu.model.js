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
        day: { type: String, enum: days, required: true, unique: true },
        meals: {
            Breakfast: mealArraySchema,
            Lunch: mealArraySchema,
            Snacks: mealArraySchema,
            Dinner: mealArraySchema,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);

