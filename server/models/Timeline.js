import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['experience', 'education', 'achievement'],
        default: 'experience'
    },
    year: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    place: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'fa-solid fa-briefcase'
    },
    order: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Timeline = mongoose.model('Timeline', timelineSchema);
export default Timeline;
