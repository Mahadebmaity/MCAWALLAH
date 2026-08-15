import mongoose from 'mongoose';
import Hero from './models/Hero.js';
import dotenv from 'dotenv';
dotenv.config();

const updateHeroStyle = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_cms');
        await Hero.updateMany({}, {
            $set: {
                layoutStyle: 'glassmorphism'
            }
        });
        console.log('✅ Hero layoutStyle updated to glassmorphism in DB');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

updateHeroStyle();
