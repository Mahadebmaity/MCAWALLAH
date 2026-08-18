import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Local uploads directory for fallback
const uploadDir = path.resolve('public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure memory storage (ideal for streaming to Cloudinary)
const storage = multer.memoryStorage();

// File filter (images and PDF/Docs)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream'
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf|doc|docx)$/i)) {
        cb(null, true);
    } else {
        cb(new Error('Only Images, PDFs, and Word documents are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max limit
    }
});

/**
 * Flexible upload middleware that accepts any field name ('image', 'file', 'avatar', 'document', 'photo')
 * and normalizes the first uploaded file to req.file.
 * Prevents "MulterError: Unexpected field" errors across all upload endpoints.
 */
export const uploadFlexible = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        if (req.files && req.files.length > 0) {
            req.file = req.files[0];
        }
        next();
    });
};

