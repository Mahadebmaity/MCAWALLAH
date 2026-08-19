import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['signup', 'reset-password', 'verify-email'],
        default: 'signup'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Automatically delete after 10 minutes (600 seconds)
    }
});

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
