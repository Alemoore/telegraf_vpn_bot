import mongoose from 'mongoose';

const userKeySchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        index: true
    },
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const UserKey = mongoose.model('UserKey', userKeySchema);
