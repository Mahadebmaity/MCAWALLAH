import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
    isPublic: { type: Boolean, default: true },
    brandName: { type: String, default: 'Mahadeb' },
    brandPrefix: { type: String, default: '<' },
    brandSuffix: { type: String, default: '/>' },
    bio: {
        type: String,
        default: 'Building beautiful, performant web experiences that users love. Passionate about clean code, great design, and meaningful products.'
    },
    contactEmail: { type: String, default: 'you@email.com' },
    contactPhone: { type: String, default: '+91 12345 67890' },
    contactLocation: { type: String, default: 'Haldia, West Bengal, India' },
    newsletterTitle: { type: String, default: 'NEWSLETTER' },
    newsletterSubtitle: { type: String, default: 'Get updates on new projects and articles. No spam, ever.' },
    newsletterButtonText: { type: String, default: 'Subscribe' },
    copyrightText: { type: String, default: 'Mahadeb Maity. Built with React & Node.js' },
    showNewsletter: { type: Boolean, default: true },
    showSocials: { type: Boolean, default: true },
    showQuickLinks: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    quickLinks: [{
        label: { type: String, required: true },
        href: { type: String, required: true },
        isVisible: { type: Boolean, default: true }
    }],
    socials: [{
        label: { type: String, required: true },
        icon: { type: String, required: true },
        href: { type: String, required: true },
        color: { type: String, default: '#38bdf8' },
        isVisible: { type: Boolean, default: true }
    }]
}, {
    timestamps: true
});

export default mongoose.model('Footer', footerSchema);
