import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [ 'student', 'admin', 'warden' ],
        default: 'student',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    year: {
        type: String, // 'UG-1', 'UG-2', 'PG-1', etc. Could vary by college
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
        index: true
    },
    roomNo: String,
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);