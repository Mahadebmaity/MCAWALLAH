import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import seedInitialData from './seeds/seedData.js';

import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import playgroundRoutes from './routes/playgroundRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            CLIENT_URL,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173'
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev mode
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploaded files and documentation under root and /api prefixes
import { getUploadDirectories, getDocsDirectories, findFileInUploadsOrDocs } from './utils/fileStorage.js';

getUploadDirectories().forEach(dir => {
    if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
    }
    if (fs.existsSync(dir)) {
        app.use('/uploads', express.static(dir, {
            setHeaders: (res, filePath) => {
                if (filePath.toLowerCase().endsWith('.pdf')) {
                    res.setHeader('Content-Type', 'application/pdf');
                }
            }
        }));
        app.use('/api/uploads', express.static(dir, {
            setHeaders: (res, filePath) => {
                if (filePath.toLowerCase().endsWith('.pdf')) {
                    res.setHeader('Content-Type', 'application/pdf');
                }
            }
        }));
    }
});

getDocsDirectories().forEach(dir => {
    if (fs.existsSync(dir)) {
        app.use('/docs', express.static(dir, {
            setHeaders: (res, filePath) => {
                if (filePath.toLowerCase().endsWith('.pdf')) {
                    res.setHeader('Content-Type', 'application/pdf');
                }
            }
        }));
        app.use('/api/docs', express.static(dir, {
            setHeaders: (res, filePath) => {
                if (filePath.toLowerCase().endsWith('.pdf')) {
                    res.setHeader('Content-Type', 'application/pdf');
                }
            }
        }));
    }
});

// Dedicated file download / preview route that guarantees valid PDF headers and avoids HTML fallbacks
app.get(['/uploads/:filename', '/api/uploads/:filename', '/api/download'], (req, res) => {
    const filename = req.params.filename || req.query.file || req.query.url || '';
    const isDownload = req.query.download === '1' || req.query.dl === 'true';
    const customTitle = req.query.title || filename;

    const localFilePath = findFileInUploadsOrDocs(filename);

    if (localFilePath) {
        if (localFilePath.toLowerCase().endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        }
        if (isDownload) {
            const cleanDownloadName = (customTitle.endsWith('.pdf') ? customTitle : `${customTitle}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename="${cleanDownloadName}"`);
        }
        return res.sendFile(localFilePath);
    }

    // Fallback: If a PDF was requested but the exact local file name is missing, serve default documentation or resume PDF
    if (filename.toLowerCase().endsWith('.pdf')) {
        const fallbackPdf = findFileInUploadsOrDocs('PORTFOLIO_SYSTEM_DOCUMENTATION.pdf') ||
                            findFileInUploadsOrDocs('resume.pdf') ||
                            findFileInUploadsOrDocs('PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf');
        if (fallbackPdf) {
            res.setHeader('Content-Type', 'application/pdf');
            if (isDownload) {
                res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`);
            }
            return res.sendFile(fallbackPdf);
        }
    }

    res.status(404).json({
        status: 404,
        message: `File "${filename}" not found.`,
        filename
    });
});


// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // Compatibility with frontend useAuth endpoints
app.use('/api/portfolio', publicRoutes);
app.use('/api/portfolio/ai', aiRoutes);
app.use('/api/portfolio/playgrounds', playgroundRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Connect DB & Start Server
const startServer = async () => {
    try {
        const conn = await connectDB();
        if (conn) {
            // Auto seed initial data if empty
            await seedInitialData();
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Portfolio CMS Server running on http://0.0.0.0:${PORT} (available on local network)`);
            console.log(`📡 Public API: http://localhost:${PORT}/api/portfolio/public`);
            console.log(`🔒 Admin API:  http://localhost:${PORT}/api/admin/overview`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
    }
};

startServer();
