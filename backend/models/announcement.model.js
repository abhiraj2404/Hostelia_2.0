import mongoose from 'mongoose';

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
    }
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
