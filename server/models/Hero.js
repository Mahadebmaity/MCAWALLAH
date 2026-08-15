import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
    badgeText: {
        type: String,
        default: 'Available for work'
    },
    showBadge: {
        type: Boolean,
        default: true
    },
    greeting: {
        type: String,
        default: "Hello, I'm"
    },
    showGreeting: {
        type: Boolean,
        default: true
    },
    firstName: {
        type: String,
        default: 'MCA'
    },
    lastName: {
        type: String,
        default: 'WALLAH'
    },
    rolePrefix: {
        type: String,
        default: '—'
    },
    typewriterRoles: [{
        type: String,
        trim: true
    }],
    showTypewriter: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        default: 'I craft elegant digital experiences that live at the intersection of design & code. Passionate about building things that actually matter.'
    },
    techPills: [{
        type: String,
        trim: true
    }],
    showTechStack: {
        type: Boolean,
        default: true
    },
    primaryCtaText: {
        type: String,
        default: 'View My Work'
    },
    primaryCtaTarget: {
        type: String,
        default: 'projects'
    },
    secondaryCtaText: {
        type: String,
        default: "Let's Talk"
    },
    secondaryCtaTarget: {
        type: String,
        default: 'contact'
    },
    showCtas: {
        type: Boolean,
        default: true
    },
    stats: [{
        value: { type: String, default: '' },
        label: { type: String, default: '' }
    }],
    showStats: {
        type: Boolean,
        default: true
    },
    socialLinks: [{
        label: { type: String },
        href: { type: String },
        icon: { type: String }
    }],
    showSocials: {
        type: Boolean,
        default: true
    },
    showParticles: {
        type: Boolean,
        default: true
    },
    layoutStyle: {
        type: String,
        default: 'glassmorphism', // 'glassmorphism' | 'split' | 'editorial' | 'hologram' | 'inline' | 'stacked'
        enum: ['glassmorphism', 'split', 'editorial', 'hologram', 'inline', 'stacked']
    },
    accentColor: {
        type: String,
        default: '#e84545'
    },
    secondaryAccentColor: {
        type: String,
        default: '#2e86de'
    },
    fontFamily: {
        type: String,
        default: 'Syne'
    },
    buttonRadius: {
        type: String,
        default: '10px'
    },
    defaultBackground: {
        type: String,
        default: 'mesh'
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Hero = mongoose.model('Hero', heroSchema);
export default Hero;
