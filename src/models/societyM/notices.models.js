import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Notice content is required']
    },
    attachment: {
        filename: String,
        path: String,
        mimetype: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    }
});

export const Notice = mongoose.model('Notice', noticeSchema);