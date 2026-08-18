import express from 'express';
import { uploadImage, deleteImage } from '../controllers/mediaController.js';
import { uploadFlexible } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Upload image/media (Protected by Admin Auth, handles any field name)
router.post('/upload', protectAdmin, uploadFlexible, uploadImage);

// Delete image (Protected by Admin Auth)
router.delete('/delete', protectAdmin, deleteImage);

export default router;

