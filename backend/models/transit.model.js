import mongoose from 'mongoose';

const transitSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    purpose: {
        type: String,
        required: true
    },
    transitStatus: {
        type: String,
        enum: [ 'ENTRY', 'EXIT' ],
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    time: {
        type: String,
        required: true,
        default: () => new Date().toTimeString().split(' ')[ 0 ]  // HH:MM:SS
    }
}, {
    timestamps: true
});

export default mongoose.model('Transit', transitSchema);
