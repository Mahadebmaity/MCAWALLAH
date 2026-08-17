import express from 'express';
import {
    getPublicPlaygrounds,
    getPlaygroundByIdOrSlug,
    getAdminPlaygrounds,
    createPlayground,
    updatePlayground,
    deletePlayground
} from '../controllers/playgroundController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.get('/', getPublicPlaygrounds);
router.get('/:idOrSlug', getPlaygroundByIdOrSlug);

// Admin Routes
router.get('/admin/all', protect, adminOnly, getAdminPlaygrounds);
router.post('/admin', protect, adminOnly, createPlayground);
router.put('/admin/:id', protect, adminOnly, updatePlayground);
router.delete('/admin/:id', protect, adminOnly, deletePlayground);

export default router;
