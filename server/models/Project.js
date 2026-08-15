import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    longDescription: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'React'
    },
    tags: [{
        type: String,
        trim: true
    }],
    icon: {
        type: String,
        default: 'fa-solid fa-folder-open'
    },
    color: {
        type: String,
        default: '#e84545'
    },
    coverImage: {
        type: String,
        default: null
    },
    galleryImages: [{
        type: String
    }],
    github: {
        type: String,
        default: ''
    },
    live: {
        type: String,
        default: ''
    },
    stars: {
        type: Number,
        default: 0
    },
    forks: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Live', 'Open Source', 'In Progress', 'Archived'],
        default: 'Live'
    },
    isFeatured: {
        type: Boolean,
        default: false
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

const Project = mongoose.model('Project', projectSchema);
export default Project;
