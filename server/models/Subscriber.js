import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed'],
        default: 'active'
    },
    ip: {
        type: String,
        default: ''
    },
    device: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('Subscriber', subscriberSchema);
