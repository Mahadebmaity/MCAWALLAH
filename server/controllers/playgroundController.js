import Playground from '../models/Playground.js';
import ActivityLog from '../models/ActivityLog.js';

const ensureDefaultPlaygrounds = async () => {
    const count = await Playground.countDocuments();
    if (count === 0) {
        await Playground.create([
            {
                title: 'MCA WALLAH Portfolio & Dynamic CMS',
                slug: 'mca-wallah-portfolio-cms',
                category: 'Full Stack',
                description: 'Modern developer portfolio with 11 custom CMS sections, Multi-Resume Vault, AI Digital Twin, and Retro Arcade Lounge.',
                liveUrl: 'http://localhost:5173',
                githubUrl: 'https://github.com/Mahadebmaity/MCAWALLAH',
                tags: ['React 19', 'Node.js', 'Express 4', 'MongoDB', 'Vite 8', 'BroadcastChannel'],
                devicePresets: { desktop: true, tablet: true, mobile: true },
                defaultView: 'live',
                codeSnippets: [
                    {
                        title: 'AiAssistant.jsx',
                        language: 'javascript',
                        code: `import { useState, useEffect } from 'react';\nimport { API_BASE } from '../../config/api';\n\nexport default function AiAssistant() {\n    const [isOpen, setIsOpen] = useState(false);\n    const [messages, setMessages] = useState([]);\n    // Multi-turn Gemini 3.6 Flash / Semantic Knowledge Graph integration\n}`
                    },
                    {
                        title: 'aiController.js',
                        language: 'javascript',
                        code: `import { GoogleGenAI } from '@google/genai';\n\nexport const chatWithAiAssistant = async (req, res) => {\n    const { message } = req.body;\n    const knowledge = await buildPortfolioKnowledge();\n    // Dual-core execution with automatic semantic fallback\n};`
                    }
                ],
                architectureNotes: 'Dual-core AI engine + MongoDB Atlas + Multi-Resume PDF generator with real-time BroadcastChannel sync across admin and public views.',
                isPublic: true,
                order: 0
            },
            {
                title: 'Task Manager & Kanban Workspace',
                slug: 'task-manager-kanban-workspace',
                category: 'Full Stack',
                description: 'Collaborative task management board featuring drag-and-drop workflow, JWT authentication, and team activity telemetry.',
                liveUrl: 'https://github.com/Mahadebmaity/MCAWALLAH',
                githubUrl: 'https://github.com/Mahadebmaity/MCAWALLAH',
                tags: ['React', 'Node.js', 'MongoDB', 'JWT Auth', 'REST API'],
                devicePresets: { desktop: true, tablet: true, mobile: true },
                defaultView: 'code',
                codeSnippets: [
                    {
                        title: 'KanbanBoard.jsx',
                        language: 'javascript',
                        code: `export default function KanbanBoard({ columns, onTaskMove }) {\n    return (\n        <div className="kanban-grid">\n            {columns.map(col => <Column key={col.id} data={col} />)}\n        </div>\n    );\n}`
                    }
                ],
                architectureNotes: 'State management powered by React Context + Optimistic UI updates with MongoDB atomic operators.',
                isPublic: true,
                order: 1
            },
            {
                title: 'Developer Arcade Lounge (Retro Minigames)',
                slug: 'developer-arcade-lounge',
                category: 'Interactive Games',
                description: 'Interactive gaming hub with Retro Snake, 2048 Number Puzzle, Typing Speed Challenge, and Tic-Tac-Toe Minimax AI.',
                liveUrl: 'http://localhost:5173/arcade',
                githubUrl: 'https://github.com/Mahadebmaity/MCAWALLAH',
                tags: ['Canvas 2D', 'Minimax AI', 'Web Audio API', 'React 19'],
                devicePresets: { desktop: true, tablet: true, mobile: true },
                defaultView: 'live',
                codeSnippets: [
                    {
                        title: 'MinimaxAI.js',
                        language: 'javascript',
                        code: `function minimax(board, depth, isMaximizing) {\n    const score = evaluate(board);\n    if (score === 10 || score === -10 || !hasMoves(board)) return score;\n    // Unbeatable decision tree recursion\n}`
                    }
                ],
                architectureNotes: 'Optimized 60 FPS HTML5 Canvas rendering + Minimax tree recursion with alpha-beta pruning.',
                isPublic: true,
                order: 2
            }
        ]);
    }
};

/**
 * @desc Get all public project playgrounds
 * @route GET /api/portfolio/playgrounds
 */
export const getPublicPlaygrounds = async (req, res) => {
    try {
        await ensureDefaultPlaygrounds();
        const playgrounds = await Playground.find({ isPublic: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        res.json(playgrounds);
    } catch (err) {
        console.error('Error fetching public playgrounds:', err);
        res.status(500).json({ message: 'Failed to load project playgrounds' });
    }
};

/**
 * @desc Get single playground by ID or Slug
 * @route GET /api/portfolio/playgrounds/:idOrSlug
 */
export const getPlaygroundByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let playground = null;

        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            playground = await Playground.findById(idOrSlug).lean();
        }
        if (!playground) {
            playground = await Playground.findOne({ slug: idOrSlug, isPublic: true }).lean();
        }

        if (!playground) {
            return res.status(404).json({ message: 'Project playground not found' });
        }

        // Increment view count asynchronously
        Playground.findByIdAndUpdate(playground._id, { $inc: { viewsCount: 1 } }).exec();

        res.json(playground);
    } catch (err) {
        console.error('Error fetching playground details:', err);
        res.status(500).json({ message: 'Failed to load playground details' });
    }
};

/**
 * @desc Get all playgrounds for Admin Studio (with stats)
 * @route GET /api/portfolio/playgrounds/admin/all
 */
export const getAdminPlaygrounds = async (req, res) => {
    try {
        await ensureDefaultPlaygrounds();
        const playgrounds = await Playground.find().sort({ order: 1, createdAt: -1 }).lean();
        const totalViews = playgrounds.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
        const totalCodeSnippets = playgrounds.reduce((acc, p) => acc + (p.codeSnippets?.length || 0), 0);

        res.json({
            playgrounds,
            stats: {
                totalCount: playgrounds.length,
                publicCount: playgrounds.filter(p => p.isPublic).length,
                totalViews,
                totalCodeSnippets
            }
        });
    } catch (err) {
        console.error('Error fetching admin playgrounds:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Create a new Playground Sandbox
 * @route POST /api/portfolio/playgrounds/admin
 */
export const createPlayground = async (req, res) => {
    try {
        const {
            title,
            slug,
            category,
            description,
            liveUrl,
            githubUrl,
            tags,
            devicePresets,
            defaultView,
            codeSnippets,
            architectureNotes,
            isPublic,
            order
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Playground title is required.' });
        }

        const generatedSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const newPlayground = await Playground.create({
            title: title.trim(),
            slug: generatedSlug,
            category: category || 'Full Stack',
            description: description || '',
            liveUrl: liveUrl || '',
            githubUrl: githubUrl || '',
            tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
            devicePresets: devicePresets || { desktop: true, tablet: true, mobile: true },
            defaultView: defaultView || 'live',
            codeSnippets: Array.isArray(codeSnippets) ? codeSnippets : [],
            architectureNotes: architectureNotes || '',
            isPublic: isPublic !== false,
            order: parseInt(order) || 0
        });

        // Log Activity
        try {
            await ActivityLog.create({
                userName: req.user?.name || 'Admin',
                userEmail: req.user?.email || null,
                userRole: req.user?.role || 'admin',
                action: 'PLAYGROUND_CREATE',
                category: 'content',
                details: `Created new project playground: "${newPlayground.title}"`,
                metadata: { playgroundId: newPlayground._id, title: newPlayground.title }
            });
        } catch {}

        res.status(201).json({
            success: true,
            message: 'Playground created successfully! 🚀',
            playground: newPlayground
        });
    } catch (err) {
        console.error('Error creating playground:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Update a Playground Sandbox
 * @route PUT /api/portfolio/playgrounds/admin/:id
 */
export const updatePlayground = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        const updated = await Playground.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Playground not found.' });
        }

        res.json({
            success: true,
            message: 'Playground updated successfully! ⚡',
            playground: updated
        });
    } catch (err) {
        console.error('Error updating playground:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Delete a Playground Sandbox
 * @route DELETE /api/portfolio/playgrounds/admin/:id
 */
export const deletePlayground = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Playground.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Playground not found.' });
        }

        res.json({
            success: true,
            message: `Playground "${deleted.title}" deleted successfully.`
        });
    } catch (err) {
        console.error('Error deleting playground:', err);
        res.status(500).json({ message: err.message });
    }
};
