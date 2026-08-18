import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

// @desc Upload Image to Cloudinary (or Local Disk Fallback)
// @route POST /api/media/upload
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        // If Cloudinary is configured with valid credentials
        if (isCloudinaryConfigured()) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolio_cms',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
                        }
                        resolve(res.json({
                            url: result.secure_url,
                            public_id: result.public_id,
                            format: result.format,
                            bytes: result.bytes
                        }));
                    }
                );
                uploadStream.end(req.file.buffer);
            });
        }

        // Local storage fallback if Cloudinary credentials are not configured yet
        const targetDirs = [
            path.resolve('public', 'uploads'),
            path.resolve('server', 'public', 'uploads')
        ];
        const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        targetDirs.forEach(dir => {
            try {
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.resolve(dir, filename), req.file.buffer);
            } catch (_) {}
        });

        const fileUrl = `/uploads/${filename}`;

        res.json({
            url: fileUrl,
            public_id: filename,
            storage: 'local'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process image upload', error: error.message });
    }
};

// @desc Delete Image
// @route DELETE /api/media/delete
export const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ message: 'public_id is required' });

        if (isCloudinaryConfigured() && !public_id.includes('-')) {
            await cloudinary.uploader.destroy(public_id);
            return res.json({ message: 'Image deleted from Cloudinary' });
        }

        // Delete from local disk
        const localPath = path.resolve('public', 'uploads', public_id);
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
