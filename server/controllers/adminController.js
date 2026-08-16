import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Project from '../models/Project.js';
import Game from '../models/Game.js';
import Message from '../models/Message.js';
import Analytics from '../models/Analytics.js';
import SiteSettings from '../models/SiteSettings.js';
import GameScore from '../models/GameScore.js';
import Navbar from '../models/Navbar.js';
import Document from '../models/Document.js';
import path from 'path';
import fs from 'fs';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc Get Full Admin Dashboard Statistics & Overview
// @route GET /api/admin/overview
export const getAdminOverview = async (req, res) => {
    try {
        const [
            projectsCount,
            publicProjectsCount,
            skillsCount,
            publicSkillsCount,
            timelineCount,
            gamesCount,
            totalMessages,
            unreadMessages,
            totalVisits,
            recentMessages,
            recentVisits
        ] = await Promise.all([
            Project.countDocuments(),
            Project.countDocuments({ isPublic: true }),
            Skill.countDocuments(),
            Skill.countDocuments({ isPublic: true }),
            Timeline.countDocuments(),
            Game.countDocuments(),
            Message.countDocuments(),
            Message.countDocuments({ isRead: false }),
            Analytics.countDocuments({ type: 'page_view' }),
            Message.find().sort({ createdAt: -1 }).limit(5),
            Analytics.find({ type: 'page_view' }).sort({ createdAt: -1 }).limit(10)
        ]);

        res.json({
            stats: {
                projects: { total: projectsCount, public: publicProjectsCount, private: projectsCount - publicProjectsCount },
                skills: { total: skillsCount, public: publicSkillsCount, private: skillsCount - publicSkillsCount },
                timeline: { total: timelineCount },
                games: { total: gamesCount },
                messages: { total: totalMessages, unread: unreadMessages },
                visits: totalVisits
            },
            recentMessages,
            recentVisits
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Generic Dynamic CRUD Handler ──
const getModel = (type) => {
    switch (type) {
        case 'hero': return Hero;
        case 'about': return About;
        case 'navbar': return Navbar;
        case 'skills': return Skill;
        case 'timeline': return Timeline;
        case 'projects': return Project;
        case 'games': return Game;
        case 'settings': return SiteSettings;
        case 'messages': return Message;
        case 'documents': return Document;
        default: return null;
    }
};

// @desc Get All Items of a specific section (including private)
// @route GET /api/admin/section/:type
export const getSectionData = async (req, res) => {
    try {
        const { type } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        if (type === 'hero' || type === 'about' || type === 'settings' || type === 'navbar') {
            let doc = await Model.findOne();
            if (!doc) doc = await Model.create({});
            return res.json(doc);
        }

        if (type === 'documents') {
            let docs = await Document.find().sort({ isBuiltin: -1, createdAt: -1 });
            if (docs.length === 0) {
                // Auto seed system documentation
                await Document.create({
                    title: 'MCA WALLAH Portfolio - Official System Architecture & Documentation',
                    category: 'System Documentation',
                    description: 'Comprehensive technical blueprint covering React 19 architecture, RESTful API endpoints, MongoDB schemas, and CMS workflows.',
                    fileUrl: '/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf',
                    fileName: 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf',
                    fileSize: '1.60 MB',
                    fileType: 'PDF',
                    isBuiltin: true,
                    tags: ['Architecture', 'API Docs', 'Mongoose', 'React 19', 'Vercel']
                });
                docs = await Document.find().sort({ isBuiltin: -1, createdAt: -1 });
            }
            return res.json(docs);
        }

        const items = await Model.find().sort({ order: 1, createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Create or Update Section Item
// @route POST /api/admin/section/:type
export const createSectionItem = async (req, res) => {
    try {
        const { type } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        if (type === 'hero' || type === 'about' || type === 'settings' || type === 'navbar') {
            const { _id, __v, createdAt, updatedAt, ...cleanBody } = req.body;
            const updated = await Model.findOneAndUpdate({}, cleanBody, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            return res.json(updated);
        }

        const newItem = await Model.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Section Item by ID
// @route PUT /api/admin/section/:type/:id
export const updateSectionItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        const { _id, __v, createdAt, updatedAt, ...cleanBody } = req.body;
        const updated = await Model.findByIdAndUpdate(id, cleanBody, { new: true });
        if (!updated) return res.status(404).json({ message: 'Item not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete Section Item by ID
// @route DELETE /api/admin/section/:type/:id
export const deleteSectionItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Toggle Public/Private Visibility
// @route PATCH /api/admin/section/:type/:id/visibility
export const toggleVisibility = async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        const item = await Model.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.isPublic = !item.isPublic;
        await item.save();

        res.json({ message: 'Visibility updated', isPublic: item.isPublic, item });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Reorder Items
// @route PATCH /api/admin/section/:type/reorder
export const reorderItems = async (req, res) => {
    try {
        const { type } = req.params;
        const { orderedIds } = req.body; // array of _id
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid section type' });

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: index }
            }
        }));

        await Model.bulkWrite(bulkOps);
        res.json({ message: 'Items reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Message Status (read/archived/starred)
// @route PATCH /api/admin/messages/:id/status
export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead, isArchived, isStarred } = req.body;

        const updateFields = {};
        if (typeof isRead === 'boolean') updateFields.isRead = isRead;
        if (typeof isArchived === 'boolean') updateFields.isArchived = isArchived;
        if (typeof isStarred === 'boolean') updateFields.isStarred = isStarred;

        const message = await Message.findByIdAndUpdate(id, updateFields, { new: true });
        if (!message) return res.status(404).json({ message: 'Message not found' });

        res.json({ message: 'Status updated', data: message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Export Entire Portfolio as JSON
// @route GET /api/admin/backup/export
export const exportBackup = async (req, res) => {
    try {
        const [hero, about, skills, timeline, projects, games, settings] = await Promise.all([
            Hero.findOne().lean(),
            About.findOne().lean(),
            Skill.find().lean(),
            Timeline.find().lean(),
            Project.find().lean(),
            Game.find().lean(),
            SiteSettings.findOne().lean()
        ]);

        const backupData = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            data: { hero, about, skills, timeline, projects, games, settings }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=portfolio_backup_${Date.now()}.json`);
        res.json(backupData);
    } catch (error) {
        res.status(500).json({ message: 'Backup export failed', error: error.message });
    }
};

// @desc Import and Restore Portfolio from JSON
// @route POST /api/admin/backup/import
export const importBackup = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ message: 'Invalid backup structure.' });
        }

        // Restore singletons
        if (data.hero) {
            const { _id, ...h } = data.hero;
            await Hero.findOneAndUpdate({}, h, { upsert: true });
        }
        if (data.about) {
            const { _id, ...a } = data.about;
            await About.findOneAndUpdate({}, a, { upsert: true });
        }
        if (data.settings) {
            const { _id, ...s } = data.settings;
            await SiteSettings.findOneAndUpdate({}, s, { upsert: true });
        }

        // Restore array collections
        if (Array.isArray(data.skills) && data.skills.length > 0) {
            await Skill.deleteMany({});
            await Skill.insertMany(data.skills.map(({ _id, ...rest }) => rest));
        }
        if (Array.isArray(data.timeline) && data.timeline.length > 0) {
            await Timeline.deleteMany({});
            await Timeline.insertMany(data.timeline.map(({ _id, ...rest }) => rest));
        }
        if (Array.isArray(data.projects) && data.projects.length > 0) {
            await Project.deleteMany({});
            await Project.insertMany(data.projects.map(({ _id, ...rest }) => rest));
        }
        if (Array.isArray(data.games) && data.games.length > 0) {
            await Game.deleteMany({});
            await Game.insertMany(data.games.map(({ _id, ...rest }) => rest));
        }

        res.json({ message: 'Portfolio backup successfully restored!' });
    } catch (error) {
        res.status(500).json({ message: 'Backup import failed', error: error.message });
    }
};

// @desc Get All Game Scores and Analytics for Admin
// @route GET /api/admin/games/scores
export const getGameAnalytics = async (req, res) => {
    try {
        const [snakeScores, puzzleScores, typingScores, recentScores, totalSessions] = await Promise.all([
            GameScore.find({ gameSlug: 'snake' }).sort({ score: -1 }).limit(10).lean(),
            GameScore.find({ gameSlug: '2048' }).sort({ score: -1 }).limit(10).lean(),
            GameScore.find({ gameSlug: 'typing' }).sort({ score: -1 }).limit(10).lean(),
            GameScore.find().sort({ createdAt: -1 }).limit(30).lean(),
            GameScore.countDocuments()
        ]);

        const playsByGame = await GameScore.aggregate([
            { $group: { _id: '$gameSlug', count: { $sum: 1 }, avgScore: { $avg: '$score' }, maxScore: { $max: '$score' } } }
        ]);

        res.json({
            totalSessions,
            playsByGame,
            leaderboards: {
                snake: snakeScores,
                puzzle2048: puzzleScores,
                typing: typingScores
            },
            recentScores
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load game analytics', error: error.message });
    }
};

// @desc Delete a Game Score Entry
// @route DELETE /api/admin/games/scores/:id
export const deleteGameScore = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await GameScore.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Score entry not found' });
        res.json({ message: 'Score entry deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Delete score failed', error: error.message });
    }
};

// @desc Upload a Document / PDF to Document Vault
// @route POST /api/admin/upload/document
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No document file uploaded' });
        }

        const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
        const fileType = req.file.mimetype.includes('pdf') ? 'PDF' : req.file.originalname.split('.').pop().toUpperCase();

        // If Cloudinary is configured with valid credentials
        if (isCloudinaryConfigured()) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolio_documents',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary document upload error:', error);
                            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
                        }
                        resolve(res.json({
                            url: result.secure_url,
                            fileName: req.file.originalname,
                            fileSize: fileSizeMB,
                            fileType,
                            public_id: result.public_id
                        }));
                    }
                );
                uploadStream.end(req.file.buffer);
            });
        }

        // Local storage fallback
        const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadPath = path.resolve('public', 'uploads', filename);
        
        fs.writeFileSync(uploadPath, req.file.buffer);

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;

        res.json({
            url: fileUrl,
            fileName: req.file.originalname,
            fileSize: fileSizeMB,
            fileType,
            storage: 'local'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
