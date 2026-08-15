import mongoose from 'mongoose';
import Navbar from './models/Navbar.js';
import dotenv from 'dotenv';
dotenv.config();

const initNavbar = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_cms');
        const existing = await Navbar.findOne();
        if (!existing) {
            await Navbar.create({
                layoutStyle: 'floating-dock',
                logoText: 'Mahadeb',
                logoPrefix: '<',
                logoSuffix: '/>',
                showLogoPulse: true,
                statusBadgeText: 'Available for work',
                showStatusBadge: false,
                showThemeToggle: true,
                showResumeButton: true,
                resumeButtonText: 'Resume',
                showHireMeButton: false,
                hireMeButtonText: "Let's Talk",
                hireMeTarget: 'contact',
                navLinks: [
                    { id: "home", label: "Home", icon: "fa-solid fa-house", isVisible: true },
                    { id: "about", label: "About", icon: "fa-solid fa-circle-user", isVisible: true },
                    { id: "projects", label: "Projects", icon: "fa-solid fa-folder-open", isVisible: true },
                    { id: "fun-game", label: "Fun Game", icon: "fa-solid fa-gamepad", isVisible: true },
                    { id: "contact", label: "Get in Touch", icon: "fa-solid fa-handshake", isVisible: true }
                ],
                blurStrength: '24px',
                borderRadius: '999px',
                accentColor: '#e84545',
                isPublic: true
            });
            console.log('✅ Default Navbar created in DB');
        } else {
            console.log('✅ Navbar document already exists');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

initNavbar();
