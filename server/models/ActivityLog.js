import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userName: {
        type: String,
        default: 'Guest Visitor'
    },
    userEmail: {
        type: String,
        default: null
    },
    userRole: {
        type: String,
        default: 'guest'
    },
    action: {
        type: String, // 'USER_SIGNUP', 'USER_LOGIN', 'GAME_PLAY', 'BUTTON_CLICK', 'RESUME_DOWNLOAD', 'PAGE_VIEW', 'CONTACT_SUBMIT', 'DOC_VIEW', 'PROFILE_UPDATE'
        required: true
    },
    category: {
        type: String, // 'auth', 'game', 'cta', 'navigation', 'contact', 'document', 'profile'
        default: 'general'
    },
    details: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    path: {
        type: String,
        default: '/'
    },
    ipAddress: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
