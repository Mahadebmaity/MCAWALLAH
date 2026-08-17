import mongoose from 'mongoose';

const codeSnippetSchema = new mongoose.Schema({
    title: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    code: { type: String, required: true }
}, { _id: true });

const playgroundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        default: 'Full Stack'
    },
    description: {
        type: String,
        default: ''
    },
    liveUrl: {
        type: String,
        default: ''
    },
    githubUrl: {
        type: String,
        default: ''
    },
    tags: [{
        type: String
    }],
    devicePresets: {
        desktop: { type: Boolean, default: true },
        tablet: { type: Boolean, default: true },
        mobile: { type: Boolean, default: true }
    },
    defaultView: {
        type: String,
        enum: ['live', 'code', 'architecture'],
        default: 'live'
    },
    codeSnippets: [codeSnippetSchema],
    architectureNotes: {
        type: String,
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Playground = mongoose.model('Playground', playgroundSchema);
export default Playground;
