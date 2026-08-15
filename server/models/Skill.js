import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'Language', 'Database', 'Design / Tools', 'Other'],
        default: 'Frontend'
    },
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 80
    },
    icon: {
        type: String,
        default: 'fa-solid fa-code'
    },
    color: {
        type: String,
        default: '#2e86de'
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

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
