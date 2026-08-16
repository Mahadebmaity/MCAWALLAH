import mongoose from 'mongoose';

const navbarSchema = new mongoose.Schema({
    layoutStyle: {
        type: String,
        default: 'floating-dock', // 'floating-dock' | 'cyber-capsule' | 'minimal-island' | 'full-width'
        enum: ['floating-dock', 'cyber-capsule', 'minimal-island', 'full-width']
    },
    logoText: {
        type: String,
        default: 'Mahadeb'
    },
    logoPrefix: {
        type: String,
        default: '<'
    },
    logoSuffix: {
        type: String,
        default: '/>'
    },
    showLogoPulse: {
        type: Boolean,
        default: true
    },
    statusBadgeText: {
        type: String,
        default: 'Available for work'
    },
    showStatusBadge: {
        type: Boolean,
        default: false
    },
    statusBadgeStyle: {
        type: String,
        default: 'emerald-radar' // 'emerald-radar' | 'cyber-cyan' | 'sunset-amber' | 'amethyst-purple' | 'crimson-fire' | 'glass-minimal'
    },
    statusBadgeAnimation: {
        type: String,
        default: 'pulse-glow' // 'pulse-glow' | 'shimmer-wave' | 'neon-breathe' | 'orbit-spin' | 'gradient-flow' | 'subtle-static'
    },
    statusBadgeIcon: {
        type: String,
        default: 'fa-solid fa-circle'
    },
    statusBadgeLinkTarget: {
        type: String,
        default: 'contact'
    },
    showStatusBadgeMobile: {
        type: Boolean,
        default: false
    },
    showThemeToggle: {
        type: Boolean,
        default: true
    },
    showResumeButton: {
        type: Boolean,
        default: true
    },
    resumeButtonText: {
        type: String,
        default: 'Resume'
    },
    showHireMeButton: {
        type: Boolean,
        default: false
    },
    hireMeButtonText: {
        type: String,
        default: "Let's Talk"
    },
    hireMeStyle: {
        type: String,
        default: 'gradient-glow', // 'gradient-glow' | 'cyber-outline' | 'glassmorphic-pill' | 'accent-solid'
        enum: ['gradient-glow', 'cyber-outline', 'glassmorphic-pill', 'accent-solid']
    },
    hireMeIcon: {
        type: String,
        default: 'fa-solid fa-paper-plane'
    },
    hireMeTarget: {
        type: String,
        default: 'contact'
    },
    navLinks: [{
        id: { type: String, required: true },
        label: { type: String, required: true },
        icon: { type: String, default: 'fa-solid fa-house' },
        isVisible: { type: Boolean, default: true }
    }],
    blurStrength: {
        type: String,
        default: '24px'
    },
    borderRadius: {
        type: String,
        default: '999px'
    },
    accentColor: {
        type: String,
        default: '#e84545'
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Navbar = mongoose.model('Navbar', navbarSchema);
export default Navbar;
