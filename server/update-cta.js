import mongoose from 'mongoose';
import Navbar from './models/Navbar.js';

async function updateCTA() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/portfolio_cms');
        await Navbar.findOneAndUpdate({}, {
            showHireMeButton: true,
            hireMeButtonText: "Let's Talk",
            hireMeStyle: "gradient-glow",
            hireMeIcon: "fa-solid fa-paper-plane",
            hireMeTarget: "contact"
        });
        console.log("✅ CTA config defaults updated in DB successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateCTA();
