import mongoose from 'mongoose';

const MomentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        default: '',
        trim: true
    },
    category: {
        type: String,
        enum: ['College Moments', 'Project Highlights', 'Hackathons & Events', 'Milestones', 'Work & Team', 'Other'],
        default: 'College Moments'
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Moment = mongoose.models.Moment || mongoose.model('Moment', MomentSchema);

export default Moment;
