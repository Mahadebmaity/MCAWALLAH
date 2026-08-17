import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    siteTitle: {
        type: String,
        default: 'Mahadeb Maity | Portfolio'
    },
    metaDescription: {
        type: String,
        default: 'Personal portfolio of Mahadeb Maity - Full Stack Developer & UI/UX Craftsman.'
    },
    metaKeywords: [{
        type: String
    }],
    ogImage: {
        type: String,
        default: null
    },
    favicon: {
        type: String,
        default: null
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: 'Our portfolio is currently undergoing updates. Please check back shortly!'
    },
    contactEmail: {
        type: String,
        default: 'mahadeb@portfolio.com'
    },
    contactPhone: {
        type: String,
        default: '+91 12345 67890'
    },
    contactLocation: {
        type: String,
        default: 'Haldia, West Bengal, India'
    },
    socialLinks: [{
        platform: { type: String },
        label: { type: String },
        url: { type: String },
        icon: { type: String },
        color: { type: String }
    }],
    activeSections: {
        hero: { type: Boolean, default: true },
        about: { type: Boolean, default: true },
        skills: { type: Boolean, default: true },
        timeline: { type: Boolean, default: true },
        projects: { type: Boolean, default: true },
        games: { type: Boolean, default: true },
        contact: { type: Boolean, default: true }
    },
    gamesSection: {
        badgeText: { type: String, default: 'Fun Zone Arcade' },
        headingMain: { type: String, default: 'Interactive' },
        headingAccent: { type: String, default: 'Gaming Lounge' },
        description: { type: String, default: 'Take a quick break! Play retro classics, test your developer typing speed, solve sliding number puzzles, or challenge our unbeatable AI bot.' },
        ctaButtonText: { type: String, default: 'Play Our Games (Opens Full Arena)' },
        showCtaButton: { type: Boolean, default: true },
        isPublic: { type: Boolean, default: true }
    },
    aiAssistant: {
        enabled: { type: Boolean, default: true },
        twinName: { type: String, default: "Mahadeb's AI Digital Twin" },
        subtitle: { type: String, default: "Full Stack Assistant • Online" },
        launcherText: { type: String, default: "Ask AI Twin" },
        avatarIcon: { type: String, default: "fa-robot" },
        welcomeMessage: { 
            type: String, 
            default: "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!" 
        },
        quickPrompts: [{
            type: String
        }],
        customInstructions: { 
            type: String, 
            default: "Represent Mahadeb professionally as a Full Stack Engineer. Highlight his React 19, Node.js, and MongoDB expertise." 
        },
        geminiApiKey: { type: String, default: '' },
        preferredEngine: { type: String, enum: ['auto', 'gemini', 'semantic'], default: 'auto' },
        temperature: { type: Number, default: 0.7 },
        showActionCards: { type: Boolean, default: true },
        enableSoundEffects: { type: Boolean, default: true },
        rateLimitPerMin: { type: Number, default: 30 }
    }
}, {
    timestamps: true
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
