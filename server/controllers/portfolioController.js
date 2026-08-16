import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Project from '../models/Project.js';
import Game from '../models/Game.js';
import Message from '../models/Message.js';
import Analytics from '../models/Analytics.js';
import SiteSettings from '../models/SiteSettings.js';
import GameScore from '../models/GameScore.js';
import Navbar from '../models/Navbar.js';
import Footer from '../models/Footer.js';
import Subscriber from '../models/Subscriber.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { sendContactNotification } from '../services/emailService.js';

// @desc Get All Public Portfolio Data in One Fast Call
// @route GET /api/portfolio/public
export const getPublicPortfolio = async (req, res) => {
    try {
        const [hero, about, skills, timeline, projects, games, settings, navbar, footer, adminUser] = await Promise.all([
            Hero.findOne({ isPublic: true }).lean(),
            About.findOne({ isPublic: true }).lean(),
            Skill.find({ isPublic: true }).sort({ order: 1, createdAt: 1 }).lean(),
            Timeline.find({ isPublic: true }).sort({ order: 1, year: -1 }).lean(),
            Project.find({ isPublic: true }).sort({ order: 1, createdAt: -1 }).lean(),
            Game.find({ isPublic: true }).sort({ order: 1, createdAt: 1 }).lean(),
            SiteSettings.findOne().lean(),
            Navbar.findOne({ isPublic: true }).lean(),
            Footer.findOne({ isPublic: true }).lean(),
            User.findOne({ role: 'admin' }).select('avatar').lean()
        ]);

        const resolvedAbout = about ? {
            ...about,
            avatarUrl: about.avatarUrl || adminUser?.avatar || null
        } : null;

        res.json({
            hero: hero || null,
            about: resolvedAbout,
            skills: skills || [],
            timeline: timeline || [],
            projects: projects || [],
            games: games || [],
            settings: settings || null,
            navbar: navbar || null,
            footer: footer || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving portfolio data', error: error.message });
    }
};

// @desc Subscribe to Newsletter
// @route POST /api/portfolio/subscribe
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await Subscriber.findOne({ email: normalizedEmail });

        if (existing) {
            if (existing.status === 'unsubscribed') {
                existing.status = 'active';
                await existing.save();
                return res.json({ message: 'Welcome back! Your newsletter subscription has been reactivated.' });
            }
            return res.json({ message: 'You are already subscribed to the newsletter!' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const device = (req.headers['user-agent'] || '').slice(0, 120);

        const newSub = await Subscriber.create({
            email: normalizedEmail,
            ip,
            device
        });

        // Record interaction in activity log
        ActivityLog.create({
            action: 'NEWSLETTER_SUBSCRIBE',
            category: 'contact',
            userEmail: normalizedEmail,
            details: `Subscribed to newsletter: ${normalizedEmail}`,
            path: '/#footer'
        }).catch(() => {});

        res.status(201).json({
            message: '🎉 Thank you for subscribing! You will receive updates on new projects & articles.',
            subscriber: newSub
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Subscription failed.' });
    }
};

// @desc Submit Contact / Feedback Form
// @route POST /api/portfolio/contact
export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const newMessage = await Message.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            ipAddress,
            userAgent
        });

        // Send email alert asynchronously without blocking response
        sendContactNotification({ name, email, subject, message }).catch(err => {
            console.warn('Failed background email dispatch:', err.message);
        });

        // Record interaction in analytics
        Analytics.create({
            type: 'contact_submit',
            targetTitle: subject,
            path: '/#contact'
        }).catch(() => {});

        res.status(201).json({
            message: 'Your message has been sent successfully! I will reply soon.',
            id: newMessage._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit message.', error: error.message });
    }
};

// @desc Record Privacy-Friendly Analytics Event
// @route POST /api/portfolio/analytics
export const recordEvent = async (req, res) => {
    try {
        const { type, targetId, targetTitle, path, referrer } = req.body;

        if (!type) return res.status(400).json({ message: 'Event type is required.' });

        await Analytics.create({
            type,
            targetId,
            targetTitle,
            path: path || '/',
            referrer: referrer || ''
        });

        // If game play event, increment play count in Game model
        if (type === 'game_play' && targetId) {
            await Game.findByIdAndUpdate(targetId, { $inc: { playCount: 1 } }).catch(() => {});
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit Game Score to Global Leaderboard
// @route POST /api/portfolio/games/:slug/score
export const submitGameScore = async (req, res) => {
    try {
        const { slug } = req.params;
        const { playerName, score, metrics, userId, userEmail } = req.body;

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({ message: 'Valid numerical score is required.' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        let resolvedPlayerName = (playerName && playerName.trim()) ? playerName.trim().slice(0, 30) : '';

        // Find user if userId or userEmail is provided
        let userDoc = null;
        if (userId) {
            userDoc = await User.findById(userId).select('name email');
        } else if (userEmail) {
            userDoc = await User.findOne({ email: userEmail.toLowerCase() }).select('name email');
        }

        if (userDoc) {
            resolvedPlayerName = userDoc.name || userDoc.email.split('@')[0];
        }

        if (!resolvedPlayerName || resolvedPlayerName.toLowerCase() === 'guest player' || resolvedPlayerName.toLowerCase() === 'anonymous player') {
            resolvedPlayerName = userDoc?.name || (userEmail ? userEmail.split('@')[0] : 'Player');
        }

        // 1. Create the score entry
        const entry = await GameScore.create({
            gameSlug: slug,
            playerName: resolvedPlayerName,
            score,
            metrics: metrics || {},
            userId: userDoc?._id || userId || null,
            ip
        });

        // 2. Increment playCount in Game collection
        await Game.findOneAndUpdate({ slug }, { $inc: { playCount: 1 } }).catch(() => {});

        // 3. Record in Analytics
        Analytics.create({
            type: 'game_play',
            targetTitle: `${slug}: ${score} pts by ${resolvedPlayerName}`,
            path: '/#fun-game'
        }).catch(() => {});

        // 4. Calculate global rank
        const higherCount = await GameScore.countDocuments({ gameSlug: slug, score: { $gt: score } });
        const rank = higherCount + 1;

        res.status(201).json({
            message: 'Score recorded successfully!',
            entry,
            rank
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record game score', error: error.message });
    }
};

// @desc Get Top 10 Global Leaderboard for a Specific Game
// @route GET /api/portfolio/games/:slug/leaderboard
export const getGameLeaderboard = async (req, res) => {
    try {
        const { slug } = req.params;

        const [topScores, totalPlays] = await Promise.all([
            GameScore.find({ gameSlug: slug })
                .sort({ score: -1, createdAt: 1 })
                .limit(10)
                .populate('userId', 'name email avatarUrl')
                .lean(),
            GameScore.countDocuments({ gameSlug: slug })
        ]);

        const formattedLeaderboard = topScores.map(item => ({
            ...item,
            playerName: item.userId?.name || (item.playerName && !item.playerName.toLowerCase().includes('guest') ? item.playerName : (item.userId?.email ? item.userId.email.split('@')[0] : item.playerName || 'Player'))
        }));

        res.json({
            gameSlug: slug,
            totalPlays,
            leaderboard: formattedLeaderboard
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load leaderboard', error: error.message });
    }
};
