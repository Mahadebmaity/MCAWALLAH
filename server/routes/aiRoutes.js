import express from 'express';
import { chatWithAiAssistant, getAiStatus } from '../controllers/aiController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for AI chat: 30 requests per minute per IP
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many queries sent to the AI Assistant. Please slow down and try again shortly.'
    }
});

router.post('/chat', aiLimiter, chatWithAiAssistant);
router.get('/status', getAiStatus);

export default router;
