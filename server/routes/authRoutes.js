import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    refreshToken,
    updateProfile,
    changePassword,
    updatePreferences,
    uploadAvatar,
    removeAvatar,
    resetToDefaultCredentials
} from '../controllers/authController.js';
import { protectUser } from '../middleware/auth.js';
import { uploadFlexible } from '../middleware/upload.js';

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Protected user profile & preferences endpoints (accessible by any signed-in user or admin)
router.get('/me', protectUser, getMe);
router.put('/profile', protectUser, updateProfile);
router.put('/password', protectUser, changePassword);
router.put('/preferences', protectUser, updatePreferences);
router.post('/reset-defaults', protectUser, resetToDefaultCredentials);

// Avatar management
router.post('/avatar', protectUser, uploadFlexible, uploadAvatar);
router.delete('/avatar', protectUser, removeAvatar);

export default router;
