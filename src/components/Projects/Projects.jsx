import { useEffect, useRef, useState } from "react";
import { usePortfolioData } from "../../context/DataContext";
import { API_BASE } from "../../config/api";
import PlaygroundModal from "../Playground/PlaygroundModal";
import "./Projects.css";

const DEFAULT_PROJECTS = [
    {
        id: 1,
        title: "Portfolio Website",
        desc: "A modern, animated personal portfolio with dark/light mode, custom backgrounds, and smooth scroll navigation.",
        tags: ["React", "CSS", "UI/UX"],
        category: "React",
        icon: "fa-solid fa-globe",
        color: "#e84545",
        github: "https://github.com",
        live: "https://yoursite.com",
        stars: 42,
        forks: 12,
        status: "Live",
    },
    {
        id: 2,
        title: "Task Manager App",
        desc: "Full-stack task management with real-time updates, drag-and-drop, and team collaboration features.",
        tags: ["React", "Node.js", "MongoDB"],
        category: "Full Stack",
        icon: "fa-solid fa-list-check",
        color: "#2e86de",
        github: "https://github.com",
        live: "https://yoursite.com",
        stars: 88,
        forks: 31,
        status: "Live",
    },
    {
        id: 3,
        title: "AI Resume Parser",
        desc: "Python-based NLP tool that extracts structured data from PDF resumes using spaCy and custom ML models.",
        tags: ["Python", "NLP", "FastAPI"],
        category: "Python",
        icon: "fa-solid fa-robot",
        color: "#27ae60",
        github: "https://github.com",
        live: null,
        stars: 134,
        forks: 45,
        status: "Open Source",
    },
    {
        id: 4,
        title: "E-Commerce Dashboard",
        desc: "Admin dashboard with real-time analytics, inventory management, and Stripe payment integration.",
        tags: ["React", "TypeScript", "Node.js"],
        category: "Full Stack",
        icon: "fa-solid fa-chart-line",
        color: "#8e44ad",
        github: "https://github.com",
        live: "https://yoursite.com",
        stars: 67,
        forks: 18,
        status: "Live",
    },
    {
        id: 5,
        title: "Design System",
        desc: "A comprehensive React component library with Storybook docs, 40+ components, and theming support.",
        tags: ["React", "Storybook", "UI/UX"],
        category: "UI/UX",
        icon: "fa-solid fa-palette",
        color: "#e67e22",
        github: "https://github.com",
        live: "https://yoursite.com",
        stars: 203,
        forks: 72,
        status: "Open Source",
    },
    {
        id: 6,
        title: "Weather CLI",
        desc: "Terminal-based weather app in Python with location detection, forecasts, and ASCII art visuals.",
        tags: ["Python", "CLI", "API"],
        category: "Python",
        icon: "fa-solid fa-cloud-sun",
        color: "#16a085",
        github: "https://github.com",
        live: null,
        stars: 56,
        forks: 14,
        status: "Open Source",
    },
];

function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

export default function Projects() {
    const { data } = usePortfolioData();
    const [active, setActive] = useState("All");
    const [headerRef, headerIn] = useInView(0.1);
    const [gridRef, gridIn] = useInView(0.05);

    // Playground state
    const [playgrounds, setPlaygrounds] = useState([]);
    const [activePlayground, setActivePlayground] = useState(null);

    useEffect(() => {
        const fetchPlaygrounds = async () => {
            try {
                const res = await fetch(`${API_BASE}/portfolio/playgrounds`);
                if (res.ok) {
                    const pData = await res.json();
                    setPlaygrounds(pData);
                }
            } catch (err) {
                console.warn('Could not fetch project playgrounds:', err);
            }
        };
        fetchPlaygrounds();
    }, []);

    const projectList = data?.projects?.length ? data.projects : DEFAULT_PROJECTS;

    // Helper: open or create dynamic sandbox for project
    const handleOpenPlayground = (project) => {
        const match = playgrounds.find(pg => 
            pg.title?.toLowerCase() === project.title?.toLowerCase() ||
            (project.title && pg.title?.toLowerCase().includes(project.title.toLowerCase()))
        );

        if (match) {
            setActivePlayground(match);
        } else {
            // Build sandbox on-the-fly for any project
            setActivePlayground({
                title: project.title,
                category: project.category || 'Full Stack',
                description: project.desc || 'Interactive live project preview & architecture breakdown.',
                liveUrl: project.live || project.github || '',
                githubUrl: project.github || '',
                tags: project.tags || ['React', 'Full Stack'],
                devicePresets: { desktop: true, tablet: true, mobile: true },
                defaultView: project.live ? 'live' : 'code',
                codeSnippets: [
                    {
                        title: `${project.title.replace(/\s+/g, '')}.jsx`,
                        language: 'javascript',
                        code: `// ${project.title} - Main Component Architecture\nimport React from 'react';\n\nexport default function ${project.title.replace(/[^a-zA-Z0-9]/g, '')}() {\n    // Engineering specification\n    return (\n        <div className="project-container">\n            <h2>${project.title}</h2>\n            <p>${project.desc || ''}</p>\n        </div>\n    );\n}`
                    }
                ],
                architectureNotes: `Key Technical Stack: ${(project.tags || []).join(', ')}\n\nFeatures: ${project.desc || 'Modern architecture with production optimizations.'}`
            });
        }
    };

    // Dynamically derive categories from project list
    const categories = ["All", ...Array.from(new Set(projectList.map(p => p.category || "React")))];

    const filtered = active === "All"
        ? projectList
        : projectList.filter((p) => p.category === active);

    return (
        <section id="projects" className="projects">
            <div className="projects__bg" aria-hidden="true">
                <div className="projects__bg-blob projects__bg-blob--1" />
                <div className="projects__bg-blob projects__bg-blob--2" />
            </div>

            <div className="projects__container">

                {/* Label */}
                <div className="projects__label">
                    <span className="projects__label-line" />
                    <span className="projects__label-text">
                        <i className="fa-solid fa-folder-open" /> Projects
                    </span>
                    <span className="projects__label-line" />
                </div>

                {/* Header */}
                <div
                    className={`projects__header projects__reveal ${headerIn ? "projects__reveal--in" : ""}`}
                    ref={headerRef}
                >
                    <h2 className="projects__title">
                        Things I've <span className="projects__title-accent">Built</span>
                    </h2>
                    <p className="projects__subtitle">
                        A selection of projects I'm proud of — from side experiments to production apps.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="projects__filters">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`projects__filter ${active === cat ? "projects__filter--active" : ""}`}
                            onClick={() => setActive(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div
                    className={`projects__grid projects__reveal ${gridIn ? "projects__reveal--in" : ""}`}
                    ref={gridRef}
                >
                    {filtered.map((p, i) => {
                        const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []);
                        return (
                            <div
                                key={p._id || p.id || i}
                                className="projects__card"
                                style={{ animationDelay: `${i * 0.08}s`, "--card-color": p.color || "#e84545" }}
                            >
                                {/* Card top banner / icon */}
                                <div className="projects__card-top">
                                    <div className="projects__card-icon" style={{ background: `${p.color || '#e84545'}22`, border: `1px solid ${p.color || '#e84545'}44` }}>
                                        <i className={p.icon || "fa-solid fa-globe"} style={{ color: p.color || "#e84545" }} />
                                    </div>
                                    <span className={`projects__card-status projects__card-status--${p.status === "Live" ? "live" : "oss"}`}>
                                        <span className="projects__status-dot" />
                                        {p.status || "Live"}
                                    </span>
                                </div>

                                {p.coverImage && (
                                    <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', margin: '4px 0 8px', background: '#0a0f1d' }}>
                                        <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {/* Info */}
                                <h3 className="projects__card-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '38px', margin: '4px 0 6px' }}>
                                    {p.title}
                                </h3>
                                <p className="projects__card-desc" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '52px', margin: '0 0 10px', lineHeight: '1.5' }}>
                                    {p.desc}
                                </p>

                                {/* Tags */}
                                <div className="projects__card-tags" style={{ maxHeight: '32px', overflow: 'hidden', marginBottom: '8px' }}>
                                    {tags.slice(0, 4).map((t, idx) => (
                                        <span key={idx} className="projects__card-tag">{t.trim()}</span>
                                    ))}
                                    {tags.length > 4 && (
                                        <span className="projects__card-tag" style={{ opacity: 0.7 }}>+{tags.length - 4}</span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="projects__card-footer" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--pr-border)' }}>
                                    <div className="projects__card-stats">
                                        <span><i className="fa-solid fa-star" /> {p.stars || 0}</span>
                                        <span><i className="fa-solid fa-code-fork" /> {p.forks || 0}</span>
                                    </div>
                                    <div className="projects__card-links" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {/* Interactive Live Playground button */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenPlayground(p)}
                                            className="projects__card-link"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                                                border: '1px solid rgba(56, 189, 248, 0.45)',
                                                color: '#38bdf8',
                                                padding: '4px 10px',
                                                width: 'auto',
                                                height: '28px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                cursor: 'pointer'
                                            }}
                                            title="Open Interactive Live Sandbox & Architecture"
                                        >
                                            <i className="fa-solid fa-laptop-code" /> Sandbox
                                        </button>

                                        {p.github && (
                                            <a href={p.github} target="_blank" rel="noopener noreferrer"
                                                className="projects__card-link" title="GitHub">
                                                <i className="fa-brands fa-github" />
                                            </a>
                                        )}
                                        {p.live && (
                                            <a href={p.live} target="_blank" rel="noopener noreferrer"
                                                className="projects__card-link projects__card-link--live" title="Live Demo">
                                                <i className="fa-solid fa-arrow-up-right-from-square" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Hover accent bar */}
                                <div className="projects__card-bar" style={{ background: p.color || "#e84545" }} />
                            </div>
                        );
                    })}
                </div>

                {/* GitHub CTA */}
                <div className="projects__cta">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="projects__cta-btn">
                        <i className="fa-brands fa-github" /> View All on GitHub
                    </a>
                </div>

            </div>

            {/* ══════════════════════════════════════════════════════════
                 INTERACTIVE PROJECT LIVE PLAYGROUND MODAL
            ══════════════════════════════════════════════════════════ */}
            {activePlayground && (
                <PlaygroundModal
                    playground={activePlayground}
                    onClose={() => setActivePlayground(null)}
                />
            )}
        </section>
    );
}
