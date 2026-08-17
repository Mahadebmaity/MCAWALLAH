import Playground from '../models/Playground.js';
import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc Get all public project playgrounds
 * @route GET /api/portfolio/playgrounds
 */
export const getPublicPlaygrounds = async (req, res) => {
    try {
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
