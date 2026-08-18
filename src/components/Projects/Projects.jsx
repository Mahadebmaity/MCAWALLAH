import { useEffect, useRef, useState, useMemo } from "react";
import { usePortfolioData } from "../../context/DataContext";
import { API_BASE, getMediaUrl } from "../../config/api";
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

const getCategoryIcon = (cat) => {
    switch ((cat || '').toLowerCase()) {
        case 'react': return 'fa-brands fa-react';
        case 'full stack': return 'fa-solid fa-layer-group';
        case 'python': return 'fa-brands fa-python';
        case 'ui/ux': return 'fa-solid fa-palette';
        case 'mobile': return 'fa-solid fa-mobile-screen-button';
        case 'open source': return 'fa-solid fa-code-branch';
        default: return 'fa-solid fa-laptop-code';
    }
};

function ProjectMediaBanner({ coverImage, title, category, color, icon, height = '140px' }) {
    const [imgFailed, setImgFailed] = useState(false);
    const mediaUrl = coverImage ? getMediaUrl(coverImage) : null;

    useEffect(() => {
        setImgFailed(false);
    }, [coverImage]);

    if (mediaUrl && !imgFailed) {
        return (
            <div style={{ height, width: '100%', position: 'relative', overflow: 'hidden', background: '#0a0f1d' }}>
                <img
                    src={mediaUrl}
                    alt=""
                    onError={() => setImgFailed(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
        );
    }

    return (
        <div style={{
            height,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 50%, ${color || '#38bdf8'}22 0%, rgba(10, 15, 29, 0.95) 85%)`
        }}>
            <i
                className={icon || getCategoryIcon(category)}
                style={{
                    fontSize: '40px',
                    color: color || 'var(--pr-accent)',
                    opacity: 0.85,
                    filter: `drop-shadow(0 0 15px ${color || '#38bdf8'}40)`
                }}
            />
        </div>
    );
}

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
    const [viewMode, setViewMode] = useState("showcase"); // 'showcase' (3D Slider) or 'grid' (Uniform Grid)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const [headerRef, headerIn] = useInView(0.1);
    const [contentRef, contentIn] = useInView(0.05);

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

    // Dynamically derive categories from project list
    const categories = ["All", ...Array.from(new Set(projectList.map(p => p.category || "React")))];

    const filtered = useMemo(() => {
        return active === "All"
            ? projectList
            : projectList.filter((p) => (p.category || 'React') === active);
    }, [projectList, active]);

    const total = filtered.length;
    const currentProject = filtered[currentIndex] || filtered[0] || projectList[0];

    // Keep currentIndex in bounds when filtered category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [active]);

    // Navigation functions for 3D Showcase
    const nextSlide = () => {
        if (total === 0) return;
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    const prevSlide = () => {
        if (total === 0) return;
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    };

    const goToSlide = (idx) => {
        if (idx >= 0 && idx < total) {
            setCurrentIndex(idx);
        }
    };

    // Autoplay Timer in Showcase mode
    useEffect(() => {
        if (viewMode !== 'showcase' || !isAutoplay || isHovered || total <= 1) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [viewMode, isAutoplay, isHovered, total, currentIndex]);

    // Keyboard Navigation
    useEffect(() => {
        if (viewMode !== 'showcase') return;
        const handleKeyDown = (e) => {
            if (activePlayground) return;
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, total, activePlayground]);

    // Touch Swipe handling for mobile slider
    const touchStartRef = useRef(0);
    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;
        if (Math.abs(diff) > 40) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    };

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
                tags: Array.isArray(project.tags) ? project.tags : (project.tags ? project.tags.split(',') : ['React', 'Full Stack']),
                devicePresets: { desktop: true, tablet: true, mobile: true },
                defaultView: project.live ? 'live' : 'code',
                codeSnippets: [
                    {
                        title: `${project.title.replace(/\s+/g, '')}.jsx`,
                        language: 'javascript',
                        code: `// ${project.title} - Main Component Architecture\nimport React from 'react';\n\nexport default function ${project.title.replace(/[^a-zA-Z0-9]/g, '')}() {\n    // Engineering specification\n    return (\n        <div className="project-container">\n            <h2>${project.title}</h2>\n            <p>${project.desc || ''}</p>\n        </div>\n    );\n}`
                    }
                ],
                architectureNotes: `Key Technical Stack: ${(Array.isArray(project.tags) ? project.tags : [project.tags]).filter(Boolean).join(', ')}\n\nFeatures: ${project.desc || 'Modern architecture with production optimizations.'}`
            });
        }
    };

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
                        <i className="fa-solid fa-folder-open" /> Projects Studio
                    </span>
                    <span className="projects__label-line" />
                </div>

                {/* Header */}
                <div
                    className={`projects__header projects__reveal ${headerIn ? "projects__reveal--in" : ""}`}
                    ref={headerRef}
                >
                    <h2 className="projects__title">
                        Featured <span className="projects__title-accent">Creations</span>
                    </h2>
                    <p className="projects__subtitle">
                        An interactive showcase of production systems, modern full-stack web applications, and open-source packages.
                    </p>

                    {/* View Switcher & Categories Bar */}
                    <div className="projects__top-bar">
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

                        {/* View Mode Switcher */}
                        <div className="projects__view-switcher" role="tablist">
                            <button
                                type="button"
                                className={`projects__view-btn ${viewMode === 'showcase' ? 'active' : ''}`}
                                onClick={() => setViewMode('showcase')}
                                title="3D Interactive Coverflow Showcase"
                            >
                                <i className="fa-solid fa-cube" /> <span>3D Showcase</span>
                            </button>
                            <button
                                type="button"
                                className={`projects__view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Uniform Symmetrical Grid Catalog"
                            >
                                <i className="fa-solid fa-table-cells" /> <span>Grid View</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                     MODE 1: 3D COVERFLOW SHOWCASE (Like Developer Moments)
                ══════════════════════════════════════════════════════════ */}
                {viewMode === 'showcase' && total > 0 && (
                    <div
                        className={`projects__showcase-wrap projects__reveal ${contentIn ? "projects__reveal--in" : ""}`}
                        ref={contentRef}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* 3D Visual Cards Stage */}
                        <div className="projects__stage">
                            {filtered.map((item, idx) => {
                                let offset = idx - currentIndex;
                                if (offset < -Math.floor(total / 2)) offset += total;
                                if (offset > Math.floor(total / 2)) offset -= total;

                                const isActive = idx === currentIndex;
                                const isPrev = offset === -1;
                                const isNext = offset === 1;
                                const isVisible = Math.abs(offset) <= 2;

                                return (
                                    <div
                                        key={item._id || item.id || idx}
                                        className={`projects__stage-card ${isActive ? 'is-active' : ''} ${isPrev ? 'is-prev' : ''} ${isNext ? 'is-next' : ''}`}
                                        style={{
                                            '--offset': offset,
                                            '--abs-offset': Math.abs(offset),
                                            '--card-color': item.color || '#38bdf8',
                                            display: isVisible ? 'block' : 'none'
                                        }}
                                        onClick={() => goToSlide(idx)}
                                        title={isActive ? item.title : `Switch to ${item.title}`}
                                    >
                                        <div className="projects__stage-card-inner">
                                            {/* Top Media Area */}
                                            <div className="projects__stage-card-media">
                                                <ProjectMediaBanner
                                                    coverImage={item.coverImage}
                                                    title={item.title}
                                                    category={item.category}
                                                    color={item.color}
                                                    icon={item.icon}
                                                    height="100%"
                                                />
                                                <div className="projects__stage-card-overlay">
                                                    <span className="projects__stage-badge-cat">
                                                        <i className={item.icon || getCategoryIcon(item.category)} /> {item.category || 'React'}
                                                    </span>
                                                    <span className={`projects__card-status projects__card-status--${item.status === 'Live' ? 'live' : 'oss'}`}>
                                                        <span className="projects__status-dot" /> {item.status || 'Live'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Base Bar */}
                                            <div className="projects__stage-card-caption">
                                                <h4 className="projects__stage-card-title">{item.title}</h4>
                                                <div className="projects__stage-card-stats">
                                                    <span><i className="fa-solid fa-star" /> {item.stars || 0}</span>
                                                    <span><i className="fa-solid fa-code-fork" /> {item.forks || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controls Bar */}
                        <div className="projects__controls-bar">
                            <button
                                type="button"
                                className="projects__nav-btn prev"
                                onClick={prevSlide}
                                aria-label="Previous Project"
                            >
                                <i className="fa-solid fa-chevron-left" />
                            </button>

                            <div className="projects__pagination-dots">
                                {filtered.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        type="button"
                                        className={`projects__dot ${dotIdx === currentIndex ? 'active' : ''}`}
                                        onClick={() => goToSlide(dotIdx)}
                                        aria-label={`Go to project ${dotIdx + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="projects__counter-pill">
                                <span>{currentIndex + 1}</span> / <span>{total}</span>
                            </div>

                            <button
                                type="button"
                                className={`projects__autoplay-btn ${isAutoplay ? 'active' : ''}`}
                                onClick={() => setIsAutoplay(prev => !prev)}
                                title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
                            >
                                <i className={`fa-solid ${isAutoplay ? 'fa-pause' : 'fa-play'}`} />
                            </button>

                            <button
                                type="button"
                                className="projects__nav-btn next"
                                onClick={nextSlide}
                                aria-label="Next Project"
                            >
                                <i className="fa-solid fa-chevron-right" />
                            </button>
                        </div>

                        {/* ── Synced Project Spotlight Story Card ── */}
                        {currentProject && (
                            <div className="projects__spotlight-card" key={currentProject._id || currentProject.id || currentIndex}>
                                <div className="projects__spotlight-header">
                                    <div className="projects__spotlight-badges">
                                        <span className="projects__spotlight-cat" style={{ '--accent': currentProject.color || '#38bdf8' }}>
                                            <i className={currentProject.icon || getCategoryIcon(currentProject.category)} /> {currentProject.category || 'React'}
                                        </span>
                                        <span className={`projects__card-status projects__card-status--${currentProject.status === 'Live' ? 'live' : 'oss'}`}>
                                            <span className="projects__status-dot" /> {currentProject.status || 'Live'}
                                        </span>
                                    </div>
                                    <div className="projects__spotlight-metrics">
                                        <span><i className="fa-solid fa-star" /> {currentProject.stars || 0} Stars</span>
                                        <span><i className="fa-solid fa-code-fork" /> {currentProject.forks || 0} Forks</span>
                                    </div>
                                </div>

                                <h3 className="projects__spotlight-title">{currentProject.title}</h3>
                                <p className="projects__spotlight-desc">{currentProject.desc}</p>

                                {/* Tags */}
                                <div className="projects__spotlight-tags">
                                    {(Array.isArray(currentProject.tags) ? currentProject.tags : (currentProject.tags ? currentProject.tags.split(',') : [])).map((t, idx) => (
                                        <span key={idx} className="projects__card-tag">#{t.trim()}</span>
                                    ))}
                                </div>

                                {/* Spotlight Actions */}
                                <div className="projects__spotlight-footer">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenPlayground(currentProject)}
                                        className="projects__btn-sandbox"
                                    >
                                        <i className="fa-solid fa-laptop-code" /> Launch Live Sandbox & Spec
                                    </button>

                                    <div className="projects__spotlight-links">
                                        {currentProject.github && (
                                            <a
                                                href={currentProject.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="projects__spotlight-btn-link"
                                                title="View GitHub Repository"
                                            >
                                                <i className="fa-brands fa-github" /> Source Code
                                            </a>
                                        )}
                                        {currentProject.live && (
                                            <a
                                                href={currentProject.live}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="projects__spotlight-btn-link live"
                                                title="View Live Demo"
                                            >
                                                <i className="fa-solid fa-arrow-up-right-from-square" /> Live Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                     MODE 2: 100% UNIFORM MEDIA BANNER GRID VIEW
                ══════════════════════════════════════════════════════════ */}
                {viewMode === 'grid' && (
                    <div
                        className={`projects__grid projects__reveal ${contentIn ? "projects__reveal--in" : ""}`}
                        ref={contentRef}
                    >
                        {filtered.map((p, i) => {
                            const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []);
                            return (
                                <div
                                    key={p._id || p.id || i}
                                    className="projects__card"
                                    style={{ animationDelay: `${i * 0.08}s`, "--card-color": p.color || "#e84545" }}
                                >
                                    {/* ── Uniform 140px Media Banner (Always Present & Perfectly Sized) ── */}
                                    <div className="projects__card-banner">
                                        <ProjectMediaBanner
                                            coverImage={p.coverImage}
                                            title={p.title}
                                            category={p.category}
                                            color={p.color}
                                            icon={p.icon}
                                            height="140px"
                                        />
                                        <div className="projects__card-banner-overlay">
                                            <span className="projects__card-cat-badge">
                                                <i className={p.icon || getCategoryIcon(p.category)} /> {p.category || 'React'}
                                            </span>
                                            <span className={`projects__card-status projects__card-status--${p.status === "Live" ? "live" : "oss"}`}>
                                                <span className="projects__status-dot" />
                                                {p.status || "Live"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content Body */}
                                    <div className="projects__card-body">
                                        {/* Clamped 2-line Title */}
                                        <h3 className="projects__card-title" title={p.title}>
                                            {p.title}
                                        </h3>

                                        {/* Clamped 3-line Description */}
                                        <p className="projects__card-desc" title={p.desc}>
                                            {p.desc}
                                        </p>

                                        {/* Tags */}
                                        <div className="projects__card-tags">
                                            {tags.slice(0, 4).map((t, idx) => (
                                                <span key={idx} className="projects__card-tag">#{t.trim()}</span>
                                            ))}
                                            {tags.length > 4 && (
                                                <span className="projects__card-tag" style={{ opacity: 0.7 }}>+{tags.length - 4}</span>
                                            )}
                                        </div>

                                        {/* Symmetrical Footer */}
                                        <div className="projects__card-footer">
                                            <div className="projects__card-stats">
                                                <span><i className="fa-solid fa-star" /> {p.stars || 0}</span>
                                                <span><i className="fa-solid fa-code-fork" /> {p.forks || 0}</span>
                                            </div>
                                            <div className="projects__card-links">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPlayground(p)}
                                                    className="projects__card-link-sandbox"
                                                    title="Open Interactive Live Sandbox"
                                                >
                                                    <i className="fa-solid fa-laptop-code" /> Sandbox
                                                </button>

                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noopener noreferrer"
                                                        className="projects__card-link" title="GitHub Source">
                                                        <i className="fa-brands fa-github" />
                                                    </a>
                                                )}
                                                {p.live && (
                                                    <a href={p.live} target="_blank" rel="noopener noreferrer"
                                                        className="projects__card-link projects__card-link--live" title="Live Website">
                                                        <i className="fa-solid fa-arrow-up-right-from-square" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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
