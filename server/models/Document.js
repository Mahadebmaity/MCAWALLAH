import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['System Documentation', 'Certificates', 'Project Reports', 'Architecture', 'Notes', 'Implementation Plans', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        default: ''
    },
    fileSize: {
        type: String,
        default: ''
    },
    fileType: {
        type: String,
        default: 'PDF'
    },
    isBuiltin: {
        type: Boolean,
        default: false
    },
    tags: [String]
}, {
    timestamps: true
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document;
