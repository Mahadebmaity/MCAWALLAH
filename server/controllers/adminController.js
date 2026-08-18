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
import Footer from '../models/Footer.js';
import Subscriber from '../models/Subscriber.js';
import Document from '../models/Document.js';
import Moment from '../models/Moment.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import path from 'path';
import fs from 'fs';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { saveBufferToAllUploadDirs } from '../utils/fileStorage.js';

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
        case 'moments': return Moment;
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
            let docs = await Document.find().sort({ isBuiltin: -1, createdAt: -1 }).lean();
            
            // Check if built-in system docs exist, if not create them
            const hasSystemDoc1 = docs.some(d => d.fileName === 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf');
            const hasSystemDoc2 = docs.some(d => d.fileName === 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf');
            const hasPlanDoc1 = docs.some(d => d.fileName === '01_AI_PORTFOLIO_ASSISTANT_PLAN.md');
            const hasPlanDoc2 = docs.some(d => d.fileName === '02_INTERACTIVE_LIVE_PLAYGROUND_PLAN.md');

            if (!hasSystemDoc1) {
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
            }

            if (!hasSystemDoc2) {
                await Document.create({
                    title: 'MCA WALLAH Portfolio - 28-Section Comprehensive Enterprise Technical Documentation',
                    category: 'System Documentation',
                    description: 'Complete 28-section industry-standard software project specification & technical report with Mermaid diagrams, API contracts, security matrices, and setup guides.',
                    fileUrl: '/docs/PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf',
                    fileName: 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf',
                    fileSize: '1.65 MB',
                    fileType: 'PDF',
                    isBuiltin: true,
                    tags: ['28-Sections', 'Enterprise Spec', 'Full-Stack Report', 'College Submission', 'GitHub']
                });
            }

            if (!hasPlanDoc1) {
                await Document.create({
                    title: 'Feature Plan 01 - AI Portfolio Assistant Digital Twin Specification',
                    category: 'Implementation Plans',
                    description: 'Full architectural roadmap for the dual-core AI Assistant, Google Gemini 3.6 Flash engine, semantic fallback, and Admin AI CMS.',
                    fileUrl: '/docs/implementation_plans/01_AI_PORTFOLIO_ASSISTANT_PLAN.md',
                    fileName: '01_AI_PORTFOLIO_ASSISTANT_PLAN.md',
                    fileSize: '12 KB',
                    fileType: 'Markdown',
                    isBuiltin: true,
                    tags: ['AI Assistant', 'Feature Roadmap', 'Gemini 3.6 Flash', 'Architecture']
                });
            }

            if (!hasPlanDoc2) {
                await Document.create({
                    title: 'Feature Plan 02 - Interactive Project Live Playground & Sandbox CMS',
                    category: 'Implementation Plans',
                    description: 'Architectural roadmap for the interactive project code sandbox, multi-device viewport toggles (Desktop/Tablet/Mobile), and Playground CMS.',
                    fileUrl: '/docs/implementation_plans/02_INTERACTIVE_LIVE_PLAYGROUND_PLAN.md',
                    fileName: '02_INTERACTIVE_LIVE_PLAYGROUND_PLAN.md',
                    fileSize: '15 KB',
                    fileType: 'Markdown',
                    isBuiltin: true,
                    tags: ['Playground', 'Live Demo', 'Device Frames', 'Code Inspector']
                });
            }

            docs = await Document.find().sort({ isBuiltin: -1, createdAt: -1 }).lean();
            
            // Sanitize any corrupt / undefined URL strings in existing DB records
            const sanitizedDocs = docs.map(doc => {
                let resolvedUrl = doc.fileUrl || doc.url || doc.secure_url || '';
                if (resolvedUrl === 'undefined' || resolvedUrl === 'null' || resolvedUrl.endsWith('/undefined')) {
                    resolvedUrl = '';
                }
                return {
                    ...doc,
                    fileUrl: resolvedUrl,
                    url: resolvedUrl
                };
            });
            return res.json(sanitizedDocs);
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

        res.json(message);
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
                            fileUrl: result.secure_url,
                            secure_url: result.secure_url,
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
        saveBufferToAllUploadDirs(filename, req.file.buffer);

        const fileUrl = `/uploads/${filename}`;

        res.json({
            url: fileUrl,
            fileUrl: fileUrl,
            secure_url: fileUrl,
            fileName: req.file.originalname,
            fileSize: fileSizeMB,
            fileType,
            storage: 'local'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Track Public / User Action Event (Button click, game play, resume download, page view)
// @route POST /api/portfolio/track
export const trackActivityEvent = async (req, res) => {
    try {
        const { action, category, details, metadata, path: reqPath, userName, userEmail } = req.body;
        if (!action) return res.status(400).json({ message: 'Action is required' });

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const log = await ActivityLog.create({
            user: req.user?._id || null,
            userName: req.user?.name || userName || 'Guest Visitor',
            userEmail: req.user?.email || userEmail || null,
            userRole: req.user?.role || 'guest',
            action,
            category: category || 'general',
            details: details || action,
            metadata: metadata || {},
            path: reqPath || '/',
            ipAddress: clientIp,
            userAgent
        });

        res.status(201).json({ success: true, logId: log._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get All Registered Users Directory with Stats
// @route GET /api/admin/users
export const getUsersDirectory = async (req, res) => {
    try {
        const [users, totalUsers, totalAdmins] = await Promise.all([
            User.find().select('-password').sort({ createdAt: -1 }).lean(),
            User.countDocuments(),
            User.countDocuments({ role: 'admin' })
        ]);

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeToday = await User.countDocuments({ lastLogin: { $gte: oneDayAgo } });

        res.json({
            users,
            totalUsers,
            totalAdmins,
            newThisWeek,
            activeToday
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update User Role (admin / user)
// @route PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'user', 'editor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        if (id === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ message: 'You cannot remove your own admin privileges.' });
        }

        const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.json({ message: `Role updated to ${role}`, user: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete User Account
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });

        res.json({ message: `Account for ${deleted.name} deleted`, id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Toggle User Suspension (Ban / Unban)
// @route PATCH /api/admin/users/:id/status
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isSuspended } = req.body;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot suspend your own admin account.' });
        }

        const user = await User.findByIdAndUpdate(id, { isSuspended }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: `User ${isSuspended ? 'suspended' : 'reactivated'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Admin Reset User Password
// @route POST /api/admin/users/:id/reset-password
export const adminResetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        res.json({ message: `Password for ${user.name} has been reset successfully.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Specific User Activity & History
// @route GET /api/admin/users/:id/activity
export const getUserActivityDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [activity, gameScores] = await Promise.all([
            ActivityLog.find({
                $or: [{ user: id }, { userEmail: user.email }]
            }).sort({ createdAt: -1 }).limit(50).lean(),
            GameScore.find({
                $or: [{ user: id }, { playerName: user.name }]
            }).sort({ createdAt: -1 }).lean()
        ]);

        res.json({
            user,
            activity,
            gameScores
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Live Activity & Workflow Telemetry Logs
// @route GET /api/admin/activity-logs
export const getActivityLogs = async (req, res) => {
    try {
        const { category, action, limit = 100 } = req.query;
        const filter = {};

        if (category && category !== 'all') filter.category = category;
        if (action && action !== 'all') filter.action = action;

        const [logs, totalEvents, totalSignups, totalLogins, totalClicks, totalGames] = await Promise.all([
            ActivityLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).lean(),
            ActivityLog.countDocuments(),
            ActivityLog.countDocuments({ action: 'USER_SIGNUP' }),
            ActivityLog.countDocuments({ action: 'USER_LOGIN' }),
            ActivityLog.countDocuments({ category: 'cta' }),
            ActivityLog.countDocuments({ category: 'game' })
        ]);

        res.json({
            logs,
            totalEvents,
            stats: {
                totalSignups,
                totalLogins,
                totalClicks,
                totalGames
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Clear Activity Logs
// @route DELETE /api/admin/activity-logs/clear
export const clearActivityLogs = async (req, res) => {
    try {
        await ActivityLog.deleteMany({});
        res.json({ message: 'Activity telemetry logs cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Footer Configuration
// @route GET /api/admin/footer
export const getFooterConfig = async (req, res) => {
    try {
        let footer = await Footer.findOne();
        if (!footer) {
            footer = await Footer.create({
                brandName: 'Mahadeb',
                brandPrefix: '<',
                brandSuffix: '/>',
                bio: 'Building beautiful, performant web experiences that users love. Passionate about clean code, great design, and meaningful products.',
                contactEmail: 'you@email.com',
                contactPhone: '+91 12345 67890',
                contactLocation: 'Haldia, West Bengal, India',
                quickLinks: [
                    { label: 'Home', href: '#home', isVisible: true },
                    { label: 'About', href: '#about', isVisible: true },
                    { label: 'Projects', href: '#projects', isVisible: true },
                    { label: 'Fun Game', href: '#fun-game', isVisible: true },
                    { label: 'Contact', href: '#contact', isVisible: true },
                    { label: 'Privacy Policy', href: '#privacy', isVisible: true }
                ],
                socials: [
                    { label: 'GitHub', icon: 'fa-brands fa-github', href: 'https://github.com', color: '#333', isVisible: true },
                    { label: 'LinkedIn', icon: 'fa-brands fa-linkedin', href: 'https://linkedin.com', color: '#0A66C2', isVisible: true },
                    { label: 'Twitter', icon: 'fa-brands fa-twitter', href: 'https://twitter.com', color: '#1DA1F2', isVisible: true },
                    { label: 'Instagram', icon: 'fa-brands fa-instagram', href: 'https://instagram.com', color: '#E1306C', isVisible: true },
                    { label: 'Facebook', icon: 'fa-brands fa-facebook', href: 'https://facebook.com', color: '#1877F2', isVisible: true }
                ]
            });
        }
        res.json(footer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Footer Configuration
// @route PUT /api/admin/footer
export const updateFooterConfig = async (req, res) => {
    try {
        let footer = await Footer.findOne();
        if (footer) {
            footer = await Footer.findByIdAndUpdate(footer._id, req.body, { new: true });
        } else {
            footer = await Footer.create(req.body);
        }
        res.json({ message: 'Footer configuration updated successfully', footer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get All Newsletter Subscribers
// @route GET /api/admin/subscribers
export const getSubscribers = async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) filter.email = { $regex: search, $options: 'i' };

        const [subscribers, totalSubscribers, activeCount, unsubscribedCount] = await Promise.all([
            Subscriber.find(filter).sort({ createdAt: -1 }).lean(),
            Subscriber.countDocuments(),
            Subscriber.countDocuments({ status: 'active' }),
            Subscriber.countDocuments({ status: 'unsubscribed' })
        ]);

        res.json({
            subscribers,
            totalSubscribers,
            activeCount,
            unsubscribedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Toggle Subscriber Status (Active / Unsubscribed)
// @route PATCH /api/admin/subscribers/:id/status
export const toggleSubscriberStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await Subscriber.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Subscriber not found' });
        res.json({ message: `Subscriber marked as ${status}`, subscriber: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete Subscriber
// @route DELETE /api/admin/subscribers/:id
export const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Subscriber.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Subscriber not found' });
        res.json({ message: 'Subscriber deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
