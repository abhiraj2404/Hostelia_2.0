import mongoose from 'mongoose';

const feeSubmissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    hostelFee: {
        status: {
            type: String,
            enum: [ 'documentNotSubmitted', 'pending', 'approved', 'rejected' ],
            default: 'documentNotSubmitted'
        },
        documentUrl: {
            type: String,
            default: undefined
        }
    },
    messFee: {
        status: {
            type: String,
            enum: [ 'documentNotSubmitted', 'pending', 'approved', 'rejected' ],
            default: 'documentNotSubmitted'
        },
        documentUrl: {
            type: String,
            default: undefined
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('FeeSubmission', feeSubmissionSchema);

