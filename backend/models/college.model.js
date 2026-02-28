import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        emailDomain: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        adminEmail: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
        },
        logo: {
            type: String, // Cloudinary URL
            trim: true,
        },
        numberOfHostels: {
            type: Number,
            default: 0,
        },
        subscriptionStatus: {
            type: String,
            enum: [ "trial", "active", "inactive" ],
            default: "trial",
        },
        subscriptionExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexing for faster lookups during registration/auth

export default mongoose.model("College", collegeSchema);
