import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Project from '../models/Project.js';
import Game from '../models/Game.js';
import SiteSettings from '../models/SiteSettings.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedInitialData = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_cms';
        console.log(`Connecting to MongoDB for seeding at ${uri}...`);
        await mongoose.connect(uri);

        console.log('🌱 Seeding database with initial portfolio data...');

        // 1. Seed Admin User
        const adminEmail = (process.env.ADMIN_EMAIL || 'mahadeb@portfolio.com').toLowerCase();
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: process.env.ADMIN_NAME || 'Mahadeb Maity',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'Admin@123456',
                role: 'admin',
                preferences: { darkMode: true, background: 'mesh', accentColor: '#e84545' }
            });
            console.log(`✅ Admin user seeded: ${adminEmail}`);
        }

        // 2. Seed Hero Section
        const heroExists = await Hero.findOne();
        if (!heroExists) {
            await Hero.create({
                badgeText: 'Available for work',
                showBadge: true,
                greeting: "Hello, I'm",
                firstName: 'MCA',
                lastName: 'WALLAH',
                rolePrefix: 'I build',
                typewriterRoles: [
                    'Full Stack Developer',
                    'UI/UX Enthusiast',
                    'Open Source Contributor',
                    'Problem Solver',
                    'React Craftsman'
                ],
                bio: 'I craft elegant digital experiences that live at the intersection of design & code. Passionate about building things that actually matter.',
                techPills: ['React', 'Node.js', 'TypeScript', 'Figma', 'Python'],
                primaryCtaText: 'View My Work',
                primaryCtaTarget: 'projects',
                secondaryCtaText: "Let's Talk",
                secondaryCtaTarget: 'contact',
                stats: [
                    { value: '3+', label: 'Years Exp.' },
                    { value: '40+', label: 'Projects' },
                    { value: '15+', label: 'Clients' },
                    { value: '∞', label: 'Coffee ☕' }
                ],
                socialLinks: [
                    { label: 'GitHub', href: 'https://github.com', icon: 'fa-brands fa-github' },
                    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'fa-brands fa-linkedin' },
                    { label: 'Twitter', href: 'https://twitter.com', icon: 'fa-brands fa-x-twitter' },
                    { label: 'Email', href: 'mailto:mahadeb@portfolio.com', icon: 'fa-solid fa-envelope' }
                ],
                defaultBackground: 'mesh',
                isPublic: true
            });
            console.log('✅ Hero section seeded');
        }

        // 3. Seed About Section
        const aboutExists = await About.findOne();
        if (!aboutExists) {
            await About.create({
                displayName: 'Mahadeb Maity',
                title: 'Full Stack Developer',
                location: 'Haldia, West Bengal, India',
                paragraphs: [
                    "I'm a passionate Full Stack Developer based in Haldia, West Bengal, India. I love turning complex problems into elegant, user-friendly solutions. With 3+ years of experience, I specialise in building fast, accessible, and beautiful web applications that people enjoy using.",
                    "When I'm not coding, you'll find me exploring open source projects, sipping coffee, or levelling up in my favourite games."
                ],
                quickStats: [
                    { icon: 'fa-solid fa-code', val: '3+', label: 'Years Coding' },
                    { icon: 'fa-solid fa-folder-open', val: '40+', label: 'Projects Done' },
                    { icon: 'fa-solid fa-mug-hot', val: '∞', label: 'Cups of Coffee' }
                ],
                hobbies: [
                    { icon: 'fa-solid fa-gamepad', label: 'Gaming' },
                    { icon: 'fa-solid fa-book-open', label: 'Reading' },
                    { icon: 'fa-solid fa-music', label: 'Music' },
                    { icon: 'fa-solid fa-camera', label: 'Photography' },
                    { icon: 'fa-solid fa-terminal', label: 'Open Source' },
                    { icon: 'fa-solid fa-mug-hot', label: 'Coffee' }
                ],
                resumeUrl: '/resume.pdf',
                isPublic: true
            });
            console.log('✅ About section seeded');
        }

        // 4. Seed Skills
        const skillsCount = await Skill.countDocuments();
        if (skillsCount === 0) {
            await Skill.insertMany([
                { name: 'React', category: 'Frontend', level: 90, icon: 'fa-brands fa-react', color: '#61DAFB', order: 1, isPublic: true },
                { name: 'JavaScript', category: 'Language', level: 85, icon: 'fa-brands fa-js', color: '#F7DF1E', order: 2, isPublic: true },
                { name: 'Node.js', category: 'Backend', level: 78, icon: 'fa-brands fa-node-js', color: '#68A063', order: 3, isPublic: true },
                { name: 'Python', category: 'Language', level: 72, icon: 'fa-brands fa-python', color: '#3776AB', order: 4, isPublic: true },
                { name: 'CSS / Sass', category: 'Frontend', level: 88, icon: 'fa-brands fa-css3-alt', color: '#264DE4', order: 5, isPublic: true },
                { name: 'Git', category: 'Design / Tools', level: 82, icon: 'fa-brands fa-git-alt', color: '#F05032', order: 6, isPublic: true },
                { name: 'Figma', category: 'Design / Tools', level: 70, icon: 'fa-brands fa-figma', color: '#F24E1E', order: 7, isPublic: true },
                { name: 'TypeScript', category: 'Language', level: 75, icon: 'fa-solid fa-code', color: '#3178C6', order: 8, isPublic: true }
            ]);
            console.log('✅ Skills seeded');
        }

        // 5. Seed Timeline
        const timelineCount = await Timeline.countDocuments();
        if (timelineCount === 0) {
            await Timeline.insertMany([
                {
                    type: 'experience',
                    year: '2024',
                    title: 'Senior Frontend Developer',
                    place: 'Tech Company, India',
                    desc: 'Led UI architecture for a SaaS dashboard serving 50k+ users.',
                    icon: 'fa-solid fa-briefcase',
                    order: 1,
                    isPublic: true
                },
                {
                    type: 'experience',
                    year: '2023',
                    title: 'Full Stack Developer',
                    place: 'Startup, Remote',
                    desc: 'Built REST APIs and React apps from scratch, end-to-end.',
                    icon: 'fa-solid fa-laptop-code',
                    order: 2,
                    isPublic: true
                },
                {
                    type: 'education',
                    year: '2022',
                    title: 'B.Tech — Computer Science',
                    place: 'University, West Bengal',
                    desc: 'Graduated with honours. Final project: AI-powered resume parser.',
                    icon: 'fa-solid fa-graduation-cap',
                    order: 3,
                    isPublic: true
                },
                {
                    type: 'experience',
                    year: '2021',
                    title: 'Open Source Contributor',
                    place: 'GitHub',
                    desc: 'Contributed to 10+ public repos, 200+ stars earned.',
                    icon: 'fa-brands fa-github',
                    order: 4,
                    isPublic: true
                }
            ]);
            console.log('✅ Timeline seeded');
        }

        // 6. Seed Projects
        const projectsCount = await Project.countDocuments();
        if (projectsCount === 0) {
            await Project.insertMany([
                {
                    title: 'Portfolio Website',
                    desc: 'A modern, animated personal portfolio with dark/light mode, custom backgrounds, and smooth scroll navigation.',
                    category: 'React',
                    tags: ['React', 'CSS', 'UI/UX'],
                    icon: 'fa-solid fa-globe',
                    color: '#e84545',
                    github: 'https://github.com',
                    live: 'https://yoursite.com',
                    stars: 42,
                    forks: 12,
                    status: 'Live',
                    isFeatured: true,
                    order: 1,
                    isPublic: true
                },
                {
                    title: 'Task Manager App',
                    desc: 'Full-stack task management with real-time updates, drag-and-drop, and team collaboration features.',
                    category: 'Full Stack',
                    tags: ['React', 'Node.js', 'MongoDB'],
                    icon: 'fa-solid fa-list-check',
                    color: '#2e86de',
                    github: 'https://github.com',
                    live: 'https://yoursite.com',
                    stars: 88,
                    forks: 31,
                    status: 'Live',
                    isFeatured: true,
                    order: 2,
                    isPublic: true
                },
                {
                    title: 'AI Resume Parser',
                    desc: 'Python-based NLP tool that extracts structured data from PDF resumes using spaCy and custom ML models.',
                    category: 'Python',
                    tags: ['Python', 'NLP', 'FastAPI'],
                    icon: 'fa-solid fa-robot',
                    color: '#27ae60',
                    github: 'https://github.com',
                    live: '',
                    stars: 134,
                    forks: 45,
                    status: 'Open Source',
                    isFeatured: false,
                    order: 3,
                    isPublic: true
                },
                {
                    title: 'E-Commerce Dashboard',
                    desc: 'Admin dashboard with real-time analytics, inventory management, and Stripe payment integration.',
                    category: 'Full Stack',
                    tags: ['React', 'TypeScript', 'Node.js'],
                    icon: 'fa-solid fa-chart-line',
                    color: '#8e44ad',
                    github: 'https://github.com',
                    live: 'https://yoursite.com',
                    stars: 67,
                    forks: 18,
                    status: 'Live',
                    isFeatured: false,
                    order: 4,
                    isPublic: true
                },
                {
                    title: 'Design System',
                    desc: 'A comprehensive React component library with Storybook docs, 40+ components, and theming support.',
                    category: 'UI/UX',
                    tags: ['React', 'Storybook', 'UI/UX'],
                    icon: 'fa-solid fa-palette',
                    color: '#e67e22',
                    github: 'https://github.com',
                    live: 'https://yoursite.com',
                    stars: 203,
                    forks: 72,
                    status: 'Open Source',
                    isFeatured: false,
                    order: 5,
                    isPublic: true
                },
                {
                    title: 'Weather CLI',
                    desc: 'Terminal-based weather app in Python with location detection, forecasts, and ASCII art visuals.',
                    category: 'Python',
                    tags: ['Python', 'CLI', 'API'],
                    icon: 'fa-solid fa-cloud-sun',
                    color: '#16a085',
                    github: 'https://github.com',
                    live: '',
                    stars: 56,
                    forks: 14,
                    status: 'Open Source',
                    isFeatured: false,
                    order: 6,
                    isPublic: true
                }
            ]);
            console.log('✅ Projects seeded');
        }

        // 7. Seed Games
        const gamesCount = await Game.countDocuments();
        if (gamesCount === 0) {
            await Game.insertMany([
                {
                    title: 'Retro Snake',
                    slug: 'snake',
                    type: 'built-in',
                    componentName: 'Snake',
                    desc: 'Classic retro snake game. Eat food dots, grow longer, and avoid walls or crashing into yourself!',
                    icon: 'fa-solid fa-gamepad',
                    color: '#2e86de',
                    instructions: 'Use arrow keys or touch D-pad to steer the snake.',
                    order: 1,
                    isPublic: true
                },
                {
                    title: '2048 Puzzle',
                    slug: '2048',
                    type: 'built-in',
                    componentName: 'Game2048',
                    desc: 'Join the numbers and get to the 2048 tile! Addictive mathematical slide puzzle.',
                    icon: 'fa-solid fa-cubes',
                    color: '#e67e22',
                    instructions: 'Use arrow keys or swipe to slide and merge tiles.',
                    order: 2,
                    isPublic: true
                },
                {
                    title: 'Typing Speed Challenge',
                    slug: 'typing',
                    type: 'built-in',
                    componentName: 'SpeedTyper',
                    desc: 'Comprehensive typing tutor and speed challenge with number rows, alphabet pangrams, code syntax, and real-time WPM telemetry.',
                    icon: 'fa-solid fa-keyboard',
                    color: '#27ae60',
                    instructions: 'Type the highlighted letters, numbers, or code snippets accurately to test and improve your typing speed.',
                    order: 3,
                    isPublic: true
                },
                {
                    title: 'Tic Tac Toe AI',
                    slug: 'tictactoe',
                    type: 'built-in',
                    componentName: 'TicTacToe',
                    desc: 'Classic Tic-Tac-Toe featuring smart AI (Easy & Unbeatable Minimax) plus 2-player pass-and-play mode.',
                    icon: 'fa-solid fa-xmark',
                    color: '#e84545',
                    instructions: 'Place 3 of your marks in a horizontal, vertical, or diagonal row to win.',
                    order: 4,
                    isPublic: true
                }
            ]);
            console.log('✅ Games seeded');
        }

        // 8. Seed Site Settings
        const settingsExists = await SiteSettings.findOne();
        if (!settingsExists) {
            await SiteSettings.create({
                siteTitle: 'Mahadeb Maity | Portfolio',
                metaDescription: 'Personal portfolio of Mahadeb Maity - Full Stack Developer & UI/UX Craftsman.',
                metaKeywords: ['Full Stack Developer', 'React', 'Node.js', 'Portfolio', 'Mahadeb Maity'],
                contactEmail: 'mahadeb@portfolio.com',
                contactPhone: '+91 12345 67890',
                contactLocation: 'Haldia, West Bengal, India',
                socialLinks: [
                    { platform: 'github', label: 'GitHub', url: 'https://github.com', icon: 'fa-brands fa-github', color: '#f0f0f0' },
                    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-brands fa-linkedin', color: '#0A66C2' },
                    { platform: 'twitter', label: 'Twitter', url: 'https://twitter.com', icon: 'fa-brands fa-twitter', color: '#1DA1F2' },
                    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', icon: 'fa-brands fa-instagram', color: '#E1306C' }
                ]
            });
            console.log('✅ Site settings seeded');
        }

        // 9. Seed System Documents
        const hasDoc1 = await Document.findOne({ fileName: 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf' });
        if (!hasDoc1) {
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
            console.log('✅ Document 1 seeded: PORTFOLIO_SYSTEM_DOCUMENTATION.pdf');
        }

        const hasDoc2 = await Document.findOne({ fileName: 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf' });
        if (!hasDoc2) {
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
            console.log('✅ Document 2 seeded: PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf');
        }

        console.log('🎉 Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }
};

export default seedInitialData;

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
    seedInitialData().then(() => mongoose.disconnect());
}
