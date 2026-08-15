import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
    displayName: {
        type: String,
        default: 'Mahadeb Maity'
    },
    title: {
        type: String,
        default: 'Full Stack Developer'
    },
    location: {
        type: String,
        default: 'Haldia, West Bengal, India'
    },
    avatarUrl: {
        type: String,
        default: null
    },
    paragraphs: [{
        type: String
    }],
    quickStats: [{
        icon: { type: String, default: 'fa-solid fa-code' },
        val: { type: String, default: '3+' },
        label: { type: String, default: 'Years Coding' }
    }],
    hobbies: [{
        icon: { type: String, default: 'fa-solid fa-gamepad' },
        label: { type: String, default: 'Gaming' }
    }],
    resumeUrl: {
        type: String,
        default: '/resume.pdf'
    },
    resumeLabel: {
        type: String,
        default: 'Download Resume'
    },
    resumes: [{
        title: { type: String, default: 'Latest Resume' },
        url: { type: String, required: true },
        fileName: { type: String },
        fileSize: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        isVisible: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false }
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const About = mongoose.model('About', aboutSchema);
export default About;
