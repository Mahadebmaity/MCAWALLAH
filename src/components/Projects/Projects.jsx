import { useEffect, useRef, useState } from "react";
import "./Projects.css";

const CATEGORIES = ["All", "React", "Full Stack", "Python", "UI/UX"];

const PROJECTS = [
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
    const [active, setActive] = useState("All");
    const [headerRef, headerIn] = useInView(0.1);
    const [gridRef, gridIn] = useInView(0.05);

    const filtered = active === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === active);

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
                    {CATEGORIES.map((cat) => (
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
                    {filtered.map((p, i) => (
                        <div
                            key={p.id}
                            className="projects__card"
                            style={{ animationDelay: `${i * 0.08}s`, "--card-color": p.color }}
                        >
                            {/* Card top */}
                            <div className="projects__card-top">
                                <div className="projects__card-icon" style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}>
                                    <i className={p.icon} style={{ color: p.color }} />
                                </div>
                                <span className={`projects__card-status projects__card-status--${p.status === "Live" ? "live" : "oss"}`}>
                                    <span className="projects__status-dot" />
                                    {p.status}
                                </span>
                            </div>

                            {/* Info */}
                            <h3 className="projects__card-title">{p.title}</h3>
                            <p className="projects__card-desc">{p.desc}</p>

                            {/* Tags */}
                            <div className="projects__card-tags">
                                {p.tags.map((t) => (
                                    <span key={t} className="projects__card-tag">{t}</span>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="projects__card-footer">
                                <div className="projects__card-stats">
                                    <span><i className="fa-solid fa-star" /> {p.stars}</span>
                                    <span><i className="fa-solid fa-code-fork" /> {p.forks}</span>
                                </div>
                                <div className="projects__card-links">
                                    <a href={p.github} target="_blank" rel="noopener noreferrer"
                                        className="projects__card-link" title="GitHub">
                                        <i className="fa-brands fa-github" />
                                    </a>
                                    {p.live && (
                                        <a href={p.live} target="_blank" rel="noopener noreferrer"
                                            className="projects__card-link projects__card-link--live" title="Live Demo">
                                            <i className="fa-solid fa-arrow-up-right-from-square" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Hover accent bar */}
                            <div className="projects__card-bar" style={{ background: p.color }} />
                        </div>
                    ))}
                </div>

                {/* GitHub CTA */}
                <div className="projects__cta">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="projects__cta-btn">
                        <i className="fa-brands fa-github" /> View All on GitHub
                    </a>
                </div>

            </div>
        </section>
    );
}
