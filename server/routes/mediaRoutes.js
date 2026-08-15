import express from 'express';
import { uploadImage, deleteImage } from '../controllers/mediaController.js';
import { upload } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Upload image (Protected by Admin Auth)
router.post('/upload', protectAdmin, upload.single('image'), uploadImage);

// Delete image (Protected by Admin Auth)
router.delete('/delete', protectAdmin, deleteImage);

export default router;
