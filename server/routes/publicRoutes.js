import express from 'express';
import {
    getPublicPortfolio,
    submitContact,
    subscribeNewsletter,
    recordEvent,
    submitGameScore,
    getGameLeaderboard,
    getUserGameHistory
} from '../controllers/portfolioController.js';
import { trackActivityEvent } from '../controllers/adminController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for contact submission to prevent spam (5 requests per 10 minutes per IP)
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { message: 'Too many messages sent from this IP. Please try again in 10 minutes.' }
});

// Unified public portfolio query
router.get('/public', getPublicPortfolio);

// Submit contact form message & Newsletter subscription
router.post('/contact', contactLimiter, submitContact);
router.post('/subscribe', subscribeNewsletter);

// Record interaction analytics & user activity telemetry
router.post('/analytics', recordEvent);
router.post('/track', trackActivityEvent);

// Game Scores, Global Leaderboards & User History
router.get('/games/user/history', getUserGameHistory);
router.post('/games/:slug/score', submitGameScore);
router.get('/games/:slug/leaderboard', getGameLeaderboard);

export default router;
