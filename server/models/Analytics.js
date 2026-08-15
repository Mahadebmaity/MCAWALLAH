import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['page_view', 'project_click', 'game_play', 'resume_download', 'contact_submit'],
        required: true
    },
    targetId: {
        type: String,
        default: null
    },
    targetTitle: {
        type: String,
        default: null
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    },
    path: {
        type: String,
        default: '/'
    },
    referrer: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

analyticsSchema.index({ type: 1, createdAt: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
