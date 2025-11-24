import mongoose from 'mongoose';

const commentSubSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
            type: String,
            enum: [ "student", "warden", "admin" ],
            required: true,
        },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    postedBy: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true }
    },
    fileUrl: {
        type: String,
        default: undefined
    },
    comments: {
        type: [ commentSubSchema ],
        default: [],
    }
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
