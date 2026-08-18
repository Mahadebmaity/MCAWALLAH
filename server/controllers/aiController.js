import { GoogleGenAI } from '@google/genai';
import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Project from '../models/Project.js';
import Game from '../models/Game.js';
import SiteSettings from '../models/SiteSettings.js';
import ActivityLog from '../models/ActivityLog.js';

/**
 * Builds real-time structured knowledge context from MongoDB collections
 */
async function buildPortfolioKnowledge() {
    try {
        const [hero, about, skills, timeline, projects, games, settings] = await Promise.all([
            Hero.findOne().lean(),
            About.findOne().lean(),
            Skill.find({ isPublic: true }).sort({ order: 1 }).lean(),
            Timeline.find({ isPublic: true }).sort({ order: 1 }).lean(),
            Project.find({ isPublic: true }).sort({ order: 1 }).lean(),
            Game.find({ isPublic: true }).sort({ order: 1 }).lean(),
            SiteSettings.findOne().lean()
        ]);

        const developerName = about?.displayName || 'Mahadeb Maity';
        const role = about?.title || 'Full Stack Developer';
        const location = about?.location || 'Haldia, West Bengal, India';
        const bio = about?.paragraphs?.join('\n') || hero?.bio || '';
        const techStack = hero?.techPills?.join(', ') || 'React, Node.js, Express, MongoDB, Python, JavaScript';
        const roles = hero?.typewriterRoles?.join(', ') || 'Full Stack Developer, React Craftsman';

        const skillsSummary = skills?.map(s => `- ${s.name} (${s.category}, Proficiency: ${s.level}%)`).join('\n') || 'React, Node.js, MongoDB, JavaScript, Python';
        
        const projectsSummary = projects?.map(p => 
            `- **${p.title}** (${p.category}): ${p.desc} [Tags: ${p.tags?.join(', ')}] Live: ${p.live || 'N/A'}, GitHub: ${p.github || 'N/A'}`
        ).join('\n') || 'Portfolio Website, Task Manager App, AI Resume Parser';

        const timelineSummary = timeline?.map(t => 
            `- ${t.year}: ${t.title} at ${t.place} (${t.type}) - ${t.desc || ''}`
        ).join('\n') || 'Experienced Full Stack Developer';

        const resumes = about?.resumes?.filter(r => r.isVisible !== false) || [];
        const resumeSummary = resumes.length > 0 
            ? resumes.map(r => `- ${r.title} (${r.fileSize || 'PDF'}): ${r.url}`).join('\n')
            : `- Latest Resume: ${about?.resumeUrl || '/resume.pdf'}`;

        const gamesSummary = games?.map(g => `- ${g.title} (${g.slug}): ${g.desc}`).join('\n') || 'Retro Snake, 2048, Typing Speed Challenge, Tic-Tac-Toe';

        const contactEmail = settings?.contactEmail || 'mahadeb@portfolio.com';
        const contactPhone = settings?.contactPhone || '+91 12345 67890';
        const socials = settings?.socialLinks?.map(s => `${s.label || s.platform}: ${s.url}`).join(', ') || '';

        return {
            developerName,
            role,
            location,
            bio,
            techStack,
            roles,
            skillsSummary,
            projectsSummary,
            timelineSummary,
            resumeSummary,
            gamesSummary,
            contactEmail,
            contactPhone,
            socials,
            raw: { hero, about, skills, projects, games, timeline, settings }
        };
    } catch (err) {
        console.error('Error compiling portfolio knowledge:', err);
        return null;
    }
}

/**
 * Intelligent Semantic Fallback Engine when Gemini API key is not present or offline
 */
function processSemanticIntent(query, knowledge) {
    const q = (query || '').toLowerCase().trim();
    const name = knowledge?.developerName || 'Mahadeb Maity';
    const role = knowledge?.role || 'Full Stack Developer';

    let reply = '';
    let suggestedPrompts = [];
    let actionCards = [];

    // 1. Resume Inquiries
    if (q.includes('resume') || q.includes('cv') || q.includes('biodata') || q.includes('download')) {
        reply = `📄 You can preview or download **${name}**'s latest verified resume directly. He specializes in **Full Stack Engineering, React 19, and Node.js backend systems**.`;
        suggestedPrompts = ['Tell me about his React projects', 'What are his top skills?', 'How can I contact him?'];
        actionCards = [
            {
                type: 'resume',
                title: 'Download Official Resume (PDF)',
                icon: 'fa-solid fa-file-pdf',
                target: '/resume.pdf',
                actionText: 'Download Resume'
            }
        ];
    }
    // 2. Skills & Tech Stack Inquiries
    else if (q.includes('skill') || q.includes('stack') || q.includes('technology') || q.includes('tech') || q.includes('framework') || q.includes('react') || q.includes('node') || q.includes('python')) {
        reply = `💡 **${name}** is proficient in modern web and backend technologies:\n\n` +
            `* **Frontend:** React 19, Modern JavaScript (ES6+), Vanilla CSS (Design Tokens & Glassmorphism), Vite.\n` +
            `* **Backend & APIs:** Node.js, Express 4, RESTful APIs, JWT Authentication, Multer.\n` +
            `* **Databases & Cloud:** MongoDB (Mongoose 8), Cloudinary, Atlas.\n` +
            `* **Tools & Languages:** Python, Git & GitHub, Postman, Figma.\n\n` +
            `Would you like to explore his featured projects or review his work history?`;
        suggestedPrompts = ['Show me your featured projects', 'Download your resume', 'What is your experience?'];
        actionCards = [
            {
                type: 'scroll',
                title: 'View Skills Meter Section',
                icon: 'fa-solid fa-code',
                target: 'skills',
                actionText: 'Explore Skills'
            }
        ];
    }
    // 3. Project Inquiries
    else if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built') || q.includes('app') || q.includes('github')) {
        reply = `🚀 Here are some of **${name}**'s standout engineering projects:\n\n` +
            `1. **MCA WALLAH Portfolio & Dynamic CMS:** Full-stack developer showcase with 11 CMS sections, Multi-Resume Vault, and real-time BroadcastChannel sync.\n` +
            `2. **Task Manager App:** Real-time collaborative workspace with drag-and-drop workflow built on React, Node.js, and MongoDB.\n` +
            `3. **AI Resume Parser:** NLP-powered document analysis system written in Python & FastAPI.\n` +
            `4. **Developer Arcade Lounge:** Retro gaming arena with Snake, 2048, Speed Typer, and Minimax AI.\n\n` +
            `Click below to jump directly to the live project showcase!`;
        suggestedPrompts = ['How can I contact Mahadeb?', 'What is his experience in React?', 'Play arcade games'];
        actionCards = [
            {
                type: 'scroll',
                title: 'Browse Projects Grid',
                icon: 'fa-solid fa-folder-open',
                target: 'projects',
                actionText: 'View Projects'
            },
            {
                type: 'link',
                title: 'GitHub Profile',
                icon: 'fa-brands fa-github',
                target: 'https://github.com/Mahadebmaity/MCAWALLAH',
                actionText: 'Open GitHub'
            }
        ];
    }
    // 4. Contact / Hiring / Location Inquiries
    else if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('location') || q.includes('available') || q.includes('meet') || q.includes('call')) {
        reply = `📬 **${name}** is currently **Available for Full-time & Freelance opportunities**!\n\n` +
            `* 📍 **Location:** ${knowledge?.location || 'Haldia, West Bengal, India'}\n` +
            `* 📧 **Email:** \`${knowledge?.contactEmail || 'mahadeb@portfolio.com'}\`\n` +
            `* 📞 **Phone:** \`${knowledge?.contactPhone || '+91 12345 67890'}\`\n\n` +
            `You can also send a direct message through the contact form below and he will respond promptly.`;
        suggestedPrompts = ['Download resume', 'Show me your projects', 'Tell me about yourself'];
        actionCards = [
            {
                type: 'scroll',
                title: 'Send a Message via Contact Form',
                icon: 'fa-solid fa-envelope',
                target: 'contact',
                actionText: "Let's Talk"
            }
        ];
    }
    // 5. Gaming / Fun inquiries
    else if (q.includes('game') || q.includes('arcade') || q.includes('snake') || q.includes('2048') || q.includes('typing') || q.includes('play')) {
        reply = `🎮 Take a quick developer break! **${name}** has built an embedded **Gaming Arcade** right into the portfolio featuring:\n\n` +
            `* 🐍 **Retro Snake** with difficulty multipliers\n` +
            `* 🧩 **2048 Slide Puzzle**\n` +
            `* ⌨️ **Speed Typing Challenge** (Live WPM & Accuracy meters)\n` +
            `* ❌ **Tic-Tac-Toe AI** (Unbeatable Minimax algorithm)\n\n` +
            `High scores are automatically recorded on the global MongoDB leaderboard!`;
        suggestedPrompts = ['Play Snake game', 'Show me your projects', 'Download resume'];
        actionCards = [
            {
                type: 'scroll',
                title: 'Open Fun Zone Arcade',
                icon: 'fa-solid fa-gamepad',
                target: 'games',
                actionText: 'Play Games'
            },
            {
                type: 'navigate',
                title: 'Dedicated Fullscreen Arcade Window',
                icon: 'fa-solid fa-arrow-up-right-from-square',
                target: '/arcade',
                actionText: 'Open /arcade'
            }
        ];
    }
    // 6. Experience / Education / Timeline
    else if (q.includes('experience') || q.includes('education') || q.includes('study') || q.includes('college') || q.includes('background') || q.includes('timeline') || q.includes('years')) {
        reply = `🎓 **Background & Experience of ${name}:**\n\n` +
            `* 💼 **Full Stack & Frontend Engineering:** 3+ years creating production web applications, SaaS dashboards, and responsive interfaces.\n` +
            `* 🎓 **Education:** Graduated with B.Tech in Computer Science & Engineering (Honours) from West Bengal.\n` +
            `* 🌟 **Open Source:** Active contributor with repositories on GitHub and a focus on clean modular architecture.`;
        suggestedPrompts = ['Show me your projects', 'What are your top skills?', 'Download resume'];
        actionCards = [
            {
                type: 'scroll',
                title: 'View Career Timeline',
                icon: 'fa-solid fa-graduation-cap',
                target: 'about',
                actionText: 'View Timeline'
            }
        ];
    }
    // 7. General Greetings / Intro
    else {
        reply = `👋 Hello! I'm **${name}'s AI Digital Twin & Portfolio Assistant**.\n\n` +
            `I can help you explore ${name}'s **technical skills**, **featured projects**, **work experience**, **resume downloads**, or assist you in **getting in touch** for job opportunities and freelance projects.\n\n` +
            `What would you like to know?`;
        suggestedPrompts = [
            'What are your top skills?',
            'Show me your featured projects',
            'Download your resume (PDF)',
            'How can I contact or hire you?'
        ];
        actionCards = [
            {
                type: 'resume',
                title: 'Download Resume',
                icon: 'fa-solid fa-file-pdf',
                target: '/resume.pdf',
                actionText: 'Download'
            },
            {
                type: 'scroll',
                title: 'Contact Form',
                icon: 'fa-solid fa-envelope',
                target: 'contact',
                actionText: 'Contact'
            }
        ];
    }

    return {
        reply,
        suggestedPrompts,
        actionCards,
        source: 'semantic-knowledge-engine'
    };
}

/**
 * @desc Handle AI Chat Conversation
 * @route POST /api/portfolio/ai/chat
 */
export const chatWithAiAssistant = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ message: 'A valid message string is required.' });
        }

        const userQuery = message.trim();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        // 1. Fetch real-time portfolio knowledge base
        const knowledge = await buildPortfolioKnowledge();

        let aiResponse = null;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        // 2. If Gemini API key is configured, execute via GoogleGenAI (gemini-3.6-flash / gemini-3.5-flash-lite)
        if (geminiApiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                
                const systemPrompt = `You are the official AI Digital Twin and Portfolio Assistant for ${knowledge.developerName}, a talented ${knowledge.role} based in ${knowledge.location}.
Your mission is to represent ${knowledge.developerName} professionally, enthusiastically, and accurately to recruiters, engineering managers, clients, and visitors.

Here is the verified portfolio knowledge base:
- Bio & Story: ${knowledge.bio}
- Core Roles: ${knowledge.roles}
- Tech Stack & Skills:
${knowledge.skillsSummary}
- Standout Projects:
${knowledge.projectsSummary}
- Career & Education Timeline:
${knowledge.timelineSummary}
- Verified Resumes Available:
${knowledge.resumeSummary}
- Interactive Gaming Arcade:
${knowledge.gamesSummary}
- Contact Details:
Email: ${knowledge.contactEmail}, Phone: ${knowledge.contactPhone}, Socials: ${knowledge.socials}

Instructions:
1. Speak in a friendly, articulate, and confident developer persona.
2. If asked about contact or hiring, always provide his direct email (${knowledge.contactEmail}) and mention the contact form.
3. If asked about resumes, highlight his latest PDF resume available in the Multi-Resume Vault.
4. Keep responses crisp, formatted with clean Markdown bullet points and bold highlights.
5. If the user asks something completely outside of web development, programming, or ${knowledge.developerName}'s background, politely guide them back to his engineering portfolio.`;

                // Format previous turns for context
                const historyContext = conversationHistory.slice(-4).map(turn => 
                    `${turn.sender === 'user' ? 'Visitor' : 'Assistant'}: ${turn.text}`
                ).join('\n');

                const fullInput = `${systemPrompt}\n\nRecent Conversation:\n${historyContext}\n\nVisitor Question: ${userQuery}\n\nAssistant:`;

                const response = await ai.interactions.create({
                    model: 'gemini-3.6-flash',
                    input: fullInput
                });

                const rawReply = response.output_text || response.text || '';

                if (rawReply && rawReply.trim()) {
                    // Extract suggested prompts and action cards dynamically based on intent
                    const semanticData = processSemanticIntent(userQuery, knowledge);
                    aiResponse = {
                        reply: rawReply.trim(),
                        suggestedPrompts: semanticData.suggestedPrompts,
                        actionCards: semanticData.actionCards,
                        source: 'gemini-3.6-flash'
                    };
                }
            } catch (geminiError) {
                console.warn('Gemini API query failed or rate-limited, falling back to Semantic Knowledge Engine:', geminiError.message);
            }
        }

        // 3. Fallback to Semantic Knowledge Engine if Gemini was not used or failed
        if (!aiResponse) {
            aiResponse = processSemanticIntent(userQuery, knowledge);
        }

        // 4. Log AI Interaction in ActivityLog for Admin Analytics
        try {
            await ActivityLog.create({
                userName: req.user?.name || 'Visitor (AI Chat)',
                userEmail: req.user?.email || null,
                userRole: req.user?.role || 'guest',
                action: 'AI_CHAT',
                category: 'ai_assistant',
                details: `AI Query: "${userQuery.slice(0, 100)}${userQuery.length > 100 ? '...' : ''}"`,
                metadata: {
                    query: userQuery,
                    engine: aiResponse.source,
                    replySnippet: aiResponse.reply.slice(0, 120)
                },
                ipAddress: clientIp,
                userAgent: userAgent.slice(0, 120)
            });
        } catch (logErr) {
            console.error('Failed to log AI activity:', logErr.message);
        }

        res.json({
            success: true,
            reply: aiResponse.reply,
            suggestedPrompts: aiResponse.suggestedPrompts,
            actionCards: aiResponse.actionCards,
            source: aiResponse.source,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Assistant Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'AI Assistant temporarily unavailable',
            error: error.message
        });
    }
};

/**
 * @desc Get Public AI Assistant Configuration
 * @route GET /api/portfolio/ai/config
 */
export const getAiConfig = async (req, res) => {
    try {
        const settings = await SiteSettings.findOne().lean();
        const ai = settings?.aiAssistant || {};

        const defaultPrompts = [
            '💡 What are Mahadeb\'s top skills?',
            '🚀 Show me his React projects',
            '📄 Download his verified resume',
            '📬 How can I contact or hire him?',
            '🎮 Play games in Arcade Lounge'
        ];

        res.json({
            enabled: ai.enabled !== false,
            twinName: ai.twinName || "Mahadeb's AI Digital Twin",
            subtitle: ai.subtitle || "Full Stack Assistant • Online",
            launcherText: ai.launcherText || "Ask AI Twin",
            avatarIcon: (ai.avatarIcon && ai.avatarIcon !== 'fa-robot') ? ai.avatarIcon : "fa-wand-magic-sparkles",
            welcomeMessage: ai.welcomeMessage || "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!",
            quickPrompts: (ai.quickPrompts && ai.quickPrompts.length > 0) ? ai.quickPrompts : defaultPrompts,
            showActionCards: ai.showActionCards !== false,
            enableSoundEffects: ai.enableSoundEffects !== false,
            hasGeminiKey: Boolean(ai.geminiApiKey || process.env.GEMINI_API_KEY)
        });
    } catch (err) {
        console.error('Error fetching AI public config:', err);
        res.status(500).json({ enabled: true });
    }
};

/**
 * @desc Get AI Assistant Status
 * @route GET /api/portfolio/ai/status
 */
export const getAiStatus = async (req, res) => {
    const settings = await SiteSettings.findOne().lean();
    const hasGeminiKey = Boolean(settings?.aiAssistant?.geminiApiKey || process.env.GEMINI_API_KEY);
    res.json({
        online: true,
        model: hasGeminiKey ? 'gemini-3.6-flash' : 'semantic-knowledge-engine',
        hasGeminiKey,
        enabled: settings?.aiAssistant?.enabled !== false,
        developerPersona: 'Mahadeb Maity'
    });
};

/**
 * @desc Get Admin AI Settings & Diagnostics
 * @route GET /api/admin/ai/settings
 */
export const getAiAdminSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }

        const ai = settings.aiAssistant || {};
        const hasServerEnvKey = Boolean(process.env.GEMINI_API_KEY);

        const defaultPrompts = [
            '💡 What are Mahadeb\'s top skills?',
            '🚀 Show me his React projects',
            '📄 Download his verified resume',
            '📬 How can I contact or hire him?',
            '🎮 Play games in Arcade Lounge'
        ];

        res.json({
            enabled: ai.enabled !== false,
            twinName: ai.twinName || "Mahadeb's AI Digital Twin",
            subtitle: ai.subtitle || "Full Stack Assistant • Online",
            launcherText: ai.launcherText || "Ask AI Twin",
            avatarIcon: ai.avatarIcon || "fa-robot",
            welcomeMessage: ai.welcomeMessage || "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!",
            quickPrompts: (ai.quickPrompts && ai.quickPrompts.length > 0) ? ai.quickPrompts : defaultPrompts,
            customInstructions: ai.customInstructions || "Represent Mahadeb professionally as a Full Stack Engineer. Highlight his React 19, Node.js, and MongoDB expertise.",
            geminiApiKey: ai.geminiApiKey ? '••••••••' + ai.geminiApiKey.slice(-4) : (hasServerEnvKey ? 'Configured via Server Environment (.env)' : ''),
            hasActiveKey: Boolean(ai.geminiApiKey || hasServerEnvKey),
            preferredEngine: ai.preferredEngine || 'auto',
            temperature: typeof ai.temperature === 'number' ? ai.temperature : 0.7,
            showActionCards: ai.showActionCards !== false,
            enableSoundEffects: ai.enableSoundEffects !== false,
            rateLimitPerMin: ai.rateLimitPerMin || 30
        });
    } catch (err) {
        console.error('Error fetching admin AI settings:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Update Admin AI Settings
 * @route PUT /api/admin/ai/settings
 */
export const updateAiAdminSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }

        const { 
            enabled, 
            twinName, 
            subtitle,
            launcherText,
            avatarIcon,
            welcomeMessage, 
            quickPrompts, 
            customInstructions, 
            geminiApiKey, 
            preferredEngine,
            temperature,
            showActionCards,
            enableSoundEffects,
            rateLimitPerMin
        } = req.body;

        if (!settings.aiAssistant) {
            settings.aiAssistant = {};
        }

        if (typeof enabled === 'boolean') settings.aiAssistant.enabled = enabled;
        if (twinName) settings.aiAssistant.twinName = twinName.trim();
        if (subtitle) settings.aiAssistant.subtitle = subtitle.trim();
        if (launcherText) settings.aiAssistant.launcherText = launcherText.trim();
        if (avatarIcon) settings.aiAssistant.avatarIcon = avatarIcon.trim();
        if (welcomeMessage) settings.aiAssistant.welcomeMessage = welcomeMessage.trim();
        if (Array.isArray(quickPrompts)) settings.aiAssistant.quickPrompts = quickPrompts.filter(p => p && p.trim());
        if (customInstructions) settings.aiAssistant.customInstructions = customInstructions.trim();
        if (preferredEngine) settings.aiAssistant.preferredEngine = preferredEngine;
        if (typeof temperature === 'number') settings.aiAssistant.temperature = temperature;
        if (typeof showActionCards === 'boolean') settings.aiAssistant.showActionCards = showActionCards;
        if (typeof enableSoundEffects === 'boolean') settings.aiAssistant.enableSoundEffects = enableSoundEffects;
        if (typeof rateLimitPerMin === 'number') settings.aiAssistant.rateLimitPerMin = rateLimitPerMin;

        // If user submitted a new non-masked key
        if (geminiApiKey && !geminiApiKey.startsWith('••••') && !geminiApiKey.includes('Configured via')) {
            settings.aiAssistant.geminiApiKey = geminiApiKey.trim();
        } else if (geminiApiKey === '') {
            settings.aiAssistant.geminiApiKey = '';
        }

        await settings.save();

        res.json({
            success: true,
            message: 'All AI Assistant customizations saved and active live! 🤖',
            settings: settings.aiAssistant
        });
    } catch (err) {
        console.error('Error updating admin AI settings:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Get AI Analytics & Chat Transcripts
 * @route GET /api/admin/ai/analytics
 */
export const getAiAnalytics = async (req, res) => {
    try {
        const { limit = 100, page = 1 } = req.query;
        const query = { action: 'AI_CHAT' };

        const totalChats = await ActivityLog.countDocuments(query);
        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Calculate analytics insights
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await ActivityLog.countDocuments({ ...query, createdAt: { $gte: today } });

        // Categorize common keywords
        let topicStats = {
            skills: 0,
            projects: 0,
            resumes: 0,
            contact: 0,
            arcade: 0,
            general: 0
        };

        logs.forEach(log => {
            const q = (log.metadata?.query || log.details || '').toLowerCase();
            if (q.includes('skill') || q.includes('stack') || q.includes('react') || q.includes('node')) topicStats.skills++;
            else if (q.includes('project') || q.includes('work') || q.includes('built')) topicStats.projects++;
            else if (q.includes('resume') || q.includes('cv') || q.includes('download')) topicStats.resumes++;
            else if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone')) topicStats.contact++;
            else if (q.includes('game') || q.includes('arcade') || q.includes('play')) topicStats.arcade++;
            else topicStats.general++;
        });

        res.json({
            success: true,
            totalChats,
            todayCount,
            topicStats,
            logs
        });
    } catch (err) {
        console.error('Error fetching AI analytics:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Clear AI Analytics Logs
 * @route DELETE /api/admin/ai/analytics
 */
export const clearAiAnalytics = async (req, res) => {
    try {
        const result = await ActivityLog.deleteMany({ action: 'AI_CHAT' });
        res.json({
            success: true,
            message: `Cleared ${result.deletedCount} AI chat logs successfully.`
        });
    } catch (err) {
        console.error('Error clearing AI logs:', err);
        res.status(500).json({ message: err.message });
    }
};
