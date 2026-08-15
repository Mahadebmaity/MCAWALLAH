// src/context/DataContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

const DataContext = createContext(null);

// Fallback defaults in case server is not running or initial load
const DEFAULT_PORTFOLIO_DATA = {
    hero: {
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
        defaultBackground: 'mesh'
    },
    about: {
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
        resumeUrl: '/resume.pdf'
    },
    skills: [
        { id: 1, name: 'React', category: 'Frontend', level: 90, icon: 'fa-brands fa-react', color: '#61DAFB' },
        { id: 2, name: 'JavaScript', category: 'Language', level: 85, icon: 'fa-brands fa-js', color: '#F7DF1E' },
        { id: 3, name: 'Node.js', category: 'Backend', level: 78, icon: 'fa-brands fa-node-js', color: '#68A063' },
        { id: 4, name: 'Python', category: 'Language', level: 72, icon: 'fa-brands fa-python', color: '#3776AB' },
        { id: 5, name: 'CSS / Sass', category: 'Frontend', level: 88, icon: 'fa-brands fa-css3-alt', color: '#264DE4' },
        { id: 6, name: 'Git', category: 'Design / Tools', level: 82, icon: 'fa-brands fa-git-alt', color: '#F05032' },
        { id: 7, name: 'Figma', category: 'Design / Tools', level: 70, icon: 'fa-brands fa-figma', color: '#F24E1E' },
        { id: 8, name: 'TypeScript', category: 'Language', level: 75, icon: 'fa-solid fa-code', color: '#3178C6' }
    ],
    timeline: [
        {
            type: 'experience',
            year: '2024',
            title: 'Senior Frontend Developer',
            place: 'Tech Company, India',
            desc: 'Led UI architecture for a SaaS dashboard serving 50k+ users.',
            icon: 'fa-solid fa-briefcase'
        },
        {
            type: 'experience',
            year: '2023',
            title: 'Full Stack Developer',
            place: 'Startup, Remote',
            desc: 'Built REST APIs and React apps from scratch, end-to-end.',
            icon: 'fa-solid fa-laptop-code'
        },
        {
            type: 'education',
            year: '2022',
            title: 'B.Tech — Computer Science',
            place: 'University, West Bengal',
            desc: 'Graduated with honours. Final project: AI-powered resume parser.',
            icon: 'fa-solid fa-graduation-cap'
        },
        {
            type: 'experience',
            year: '2021',
            title: 'Open Source Contributor',
            place: 'GitHub',
            desc: 'Contributed to 10+ public repos, 200+ stars earned.',
            icon: 'fa-brands fa-github'
        }
    ],
    projects: [
        {
            id: 1,
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
            status: 'Live'
        },
        {
            id: 2,
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
            status: 'Live'
        },
        {
            id: 3,
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
            status: 'Open Source'
        },
        {
            id: 4,
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
            status: 'Live'
        },
        {
            id: 5,
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
            status: 'Open Source'
        },
        {
            id: 6,
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
            status: 'Open Source'
        }
    ],
    games: [
        {
            id: 1,
            title: 'Retro Snake',
            slug: 'snake',
            type: 'built-in',
            componentName: 'Snake',
            desc: 'Classic retro snake game. Eat food dots, grow longer, and avoid walls or crashing into yourself!',
            icon: 'fa-solid fa-gamepad',
            color: '#2e86de'
        }
    ],
    settings: {
        siteTitle: 'Mahadeb Maity | Portfolio',
        contactEmail: 'mahadeb@portfolio.com',
        contactPhone: '+91 12345 67890',
        contactLocation: 'Haldia, West Bengal, India',
        socialLinks: [
            { platform: 'github', label: 'GitHub', url: 'https://github.com', icon: 'fa-brands fa-github', color: '#f0f0f0' },
            { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-brands fa-linkedin', color: '#0A66C2' },
            { platform: 'twitter', label: 'Twitter', url: 'https://twitter.com', icon: 'fa-brands fa-twitter', color: '#1DA1F2' },
            { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', icon: 'fa-brands fa-instagram', color: '#E1306C' }
        ]
    },
    navbar: {
        layoutStyle: 'floating-dock',
        logoText: 'Mahadeb',
        logoPrefix: '<',
        logoSuffix: '/>',
        showLogoPulse: true,
        statusBadgeText: 'Available for work',
        showStatusBadge: false,
        showThemeToggle: true,
        showResumeButton: true,
        resumeButtonText: 'Resume',
        showHireMeButton: false,
        hireMeButtonText: "Let's Talk",
        hireMeTarget: 'contact',
        navLinks: [
            { id: "home", label: "Home", icon: "fa-solid fa-house", isVisible: true },
            { id: "about", label: "About", icon: "fa-solid fa-circle-user", isVisible: true },
            { id: "projects", label: "Projects", icon: "fa-solid fa-folder-open", isVisible: true },
            { id: "fun-game", label: "Fun Game", icon: "fa-solid fa-gamepad", isVisible: true },
            { id: "contact", label: "Get in Touch", icon: "fa-solid fa-handshake", isVisible: true }
        ],
        blurStrength: '24px',
        borderRadius: '999px',
        accentColor: '#e84545',
        isPublic: true
    }
};

export function DataProvider({ children }) {
    const [data, setData] = useState(DEFAULT_PORTFOLIO_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolioData = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/portfolio/public`);
            if (res.ok) {
                const json = await res.json();
                setData(prev => ({
                    hero: json.hero || prev.hero,
                    about: json.about || prev.about,
                    skills: json.skills?.length ? json.skills : prev.skills,
                    timeline: json.timeline?.length ? json.timeline : prev.timeline,
                    projects: json.projects?.length ? json.projects : prev.projects,
                    games: json.games?.length ? json.games : prev.games,
                    settings: json.settings || prev.settings,
                    navbar: json.navbar || prev.navbar
                }));
            }
        } catch (err) {
            console.warn('Using offline portfolio fallback data:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolioData();

        // BroadcastChannel for instant multi-tab live sync
        let channel;
        try {
            channel = new BroadcastChannel('portfolio_cms_sync');
            channel.onmessage = () => {
                fetchPortfolioData();
            };
        } catch (e) {}

        // Re-fetch when user switches back to this tab
        const onFocus = () => fetchPortfolioData();
        const onStorage = (e) => {
            if (e.key === 'portfolio_data_updated') {
                fetchPortfolioData();
            }
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('storage', onStorage);

        // Record visitor analytics
        fetch(`${API_BASE}/portfolio/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'page_view',
                path: window.location.pathname,
                referrer: document.referrer
            })
        }).catch(() => {});

        return () => {
            if (channel) channel.close();
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('storage', onStorage);
        };
    }, [fetchPortfolioData]);

    const submitContactMessage = async (formPayload) => {
        const res = await fetch(`${API_BASE}/portfolio/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formPayload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to send message');
        return json;
    };

    return (
        <DataContext.Provider value={{
            data,
            loading,
            error,
            refreshData: fetchPortfolioData,
            submitContactMessage
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const usePortfolioData = () => useContext(DataContext);
