import express from 'express';
import { 
    chatWithAiAssistant, 
    getAiStatus, 
    getAiConfig,
    getAiAdminSettings,
    updateAiAdminSettings,
    getAiAnalytics,
    clearAiAnalytics
} from '../controllers/aiController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for public AI chat: 30 requests per minute per IP
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many queries sent to the AI Assistant. Please slow down and try again shortly.'
    }
});

// Public endpoints
router.post('/chat', aiLimiter, chatWithAiAssistant);
router.get('/status', getAiStatus);
router.get('/config', getAiConfig);

// Protected Admin Studio Endpoints
router.get('/admin/settings', protect, adminOnly, getAiAdminSettings);
router.put('/admin/settings', protect, adminOnly, updateAiAdminSettings);
router.get('/admin/analytics', protect, adminOnly, getAiAnalytics);
router.delete('/admin/analytics', protect, adminOnly, clearAiAnalytics);

export default router;
