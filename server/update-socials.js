import mongoose from 'mongoose';
import Hero from './models/Hero.js';
import dotenv from 'dotenv';
dotenv.config();

const updateHeroSocials = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_cms');
        await Hero.updateMany({}, {
            $set: {
                socialLinks: [
                    { label: 'GitHub', href: 'https://github.com', icon: 'fa-brands fa-github' },
                    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'fa-brands fa-linkedin' },
                    { label: 'Twitter', href: 'https://twitter.com', icon: 'fa-brands fa-x-twitter' },
                    { label: 'Email', href: 'mailto:mahadeb@portfolio.com', icon: 'fa-solid fa-envelope' }
                ]
            }
        });
        console.log('✅ Hero socialLinks updated in DB');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

updateHeroSocials();
