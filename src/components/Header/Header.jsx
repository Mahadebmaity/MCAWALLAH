// src/components/Header/Header.jsx
import { useState, useEffect, useRef } from "react";
import { usePortfolioData } from "../../context/DataContext";
import "./Header.css";

/* ── 8 Background Presets ── */
const BG_PRESETS = [
    { id: "mesh", label: "Mesh Gradient", icon: "🌌" },
    { id: "aurora", label: "Aurora Borealis", icon: "✨" },
    { id: "cyber", label: "Cyber Neon", icon: "⚡" },
    { id: "dots", label: "Grid Matrix", icon: "⬡" },
    { id: "sunset", label: "Sunset Glow", icon: "🌅" },
    { id: "deepspace", label: "Deep Space", icon: "🪐" },
    { id: "minimal", label: "Clean Dark", icon: "⬛" },
    { id: "ocean", label: "Ocean Wave", icon: "🌊" },
];

/* Floating ambient particles */
function Particles({ count = 30 }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.5 + 0.15,
    }));

    return (
        <div className="header__particles" aria-hidden="true">
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="header__particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </div>
    );
}

export default function Header() {
    const { data } = usePortfolioData();
    const hero = data?.hero || {};

    const [pickerOpen, setPickerOpen] = useState(false);
    const [bgPreset, setBgPreset] = useState("mesh");
    const [customBg, setCustomBg] = useState(null);
    const [customColor, setCustomColor] = useState("#0d1117");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const pickerRef = useRef(null);
    const colorRef = useRef(null);
    const widgetRef = useRef(null);

    // Draggable position state for the sticky background widget
    const [widgetPos, setWidgetPos] = useState(() => {
        try {
            const saved = localStorage.getItem("portfolio_bg_widget_pos");
            if (saved) return JSON.parse(saved);
        } catch {}
        return { x: null, y: null }; // default: CSS fixed top right
    });

    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, moved: false });

    // Initial background preset
    useEffect(() => {
        const saved = localStorage.getItem("portfolio_hero_bg");
        if (saved) {
            if (saved.startsWith("#")) {
                setCustomBg(saved);
                setCustomColor(saved);
            } else {
                setBgPreset(saved);
            }
        } else if (hero.defaultBackground) {
            setBgPreset(hero.defaultBackground);
        }
        setLoaded(true);
    }, [hero.defaultBackground]);

    // Typewriter engine
    const roles = hero.typewriterRoles?.length
        ? hero.typewriterRoles
        : ["Full Stack Craftsman", "React & Node Architect", "UI/UX Craftsman", "Open Source Builder"];

    useEffect(() => {
        const currentRole = roles[roleIndex % roles.length];
        let timeout;

        if (!isDeleting && displayed.length < currentRole.length) {
            timeout = setTimeout(() => {
                setDisplayed(currentRole.slice(0, displayed.length + 1));
            }, 80);
        } else if (!isDeleting && displayed.length === currentRole.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2400);
        } else if (isDeleting && displayed.length > 0) {
            timeout = setTimeout(() => {
                setDisplayed(currentRole.slice(0, displayed.length - 1));
            }, 45);
        } else if (isDeleting && displayed.length === 0) {
            setIsDeleting(false);
            setRoleIndex((i) => (i + 1) % roles.length);
        }

        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, roleIndex, roles]);

    // Close background dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (widgetRef.current && !widgetRef.current.contains(e.target)) {
                setPickerOpen(false);
            }
            if (colorRef.current && !colorRef.current.contains(e.target)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Drag handling for desktop mouse and mobile touch
    const onDragStart = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = widgetRef.current ? widgetRef.current.getBoundingClientRect() : { left: 0, top: 0 };
        dragStartRef.current = {
            startX: clientX,
            startY: clientY,
            initialX: rect.left,
            initialY: rect.top,
            moved: false
        };
        isDraggingRef.current = true;

        const onDragMove = (moveEvt) => {
            if (!isDraggingRef.current) return;
            const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;

            const dx = curX - dragStartRef.current.startX;
            const dy = curY - dragStartRef.current.startY;

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                dragStartRef.current.moved = true;
            }

            const w = widgetRef.current?.offsetWidth || 150;
            const h = widgetRef.current?.offsetHeight || 44;

            const newX = Math.max(10, Math.min(window.innerWidth - w - 10, dragStartRef.current.initialX + dx));
            const newY = Math.max(10, Math.min(window.innerHeight - h - 10, dragStartRef.current.initialY + dy));

            setWidgetPos({ x: newX, y: newY });
        };

        const onDragEnd = () => {
            isDraggingRef.current = false;
            window.removeEventListener("mousemove", onDragMove);
            window.removeEventListener("mouseup", onDragEnd);
            window.removeEventListener("touchmove", onDragMove);
            window.removeEventListener("touchend", onDragEnd);

            if (dragStartRef.current.moved) {
                setWidgetPos(prev => {
                    if (prev.x !== null) {
                        try {
                            localStorage.setItem("portfolio_bg_widget_pos", JSON.stringify(prev));
                        } catch {}
                    }
                    return prev;
                });
            }
        };

        window.addEventListener("mousemove", onDragMove);
        window.addEventListener("mouseup", onDragEnd);
        window.addEventListener("touchmove", onDragMove, { passive: false });
        window.addEventListener("touchend", onDragEnd);
    };

    const handleWidgetClick = () => {
        if (!dragStartRef.current.moved) {
            setPickerOpen(prev => !prev);
        }
    };

    const selectPreset = (presetId) => {
        setBgPreset(presetId);
        setCustomBg(null);
        localStorage.setItem("portfolio_hero_bg", presetId);
        setPickerOpen(false);
    };

    const applyCustomColor = () => {
        setCustomBg(customColor);
        setBgPreset("custom");
        localStorage.setItem("portfolio_hero_bg", customColor);
        setShowColorPicker(false);
        setPickerOpen(false);
    };

    const scrollDown = () => {
        const target = document.querySelector("#about") || document.querySelector("section");
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    };

    const copyDeveloperCode = () => {
        const codeSnippet = `const developer = {
  name: "${hero.firstName || 'Mahadeb'} ${hero.lastName || 'Maity'}",
  role: "${displayed || 'Full Stack Engineer'}",
  coreStack: ["${(hero.techPills || ["React", "Node.js", "TypeScript", "Python"]).slice(0, 4).join('", "')}"],
  status: "Open for opportunities 🚀",
  contact: "mahadeb@portfolio.com"
};`;
        navigator.clipboard?.writeText(codeSnippet);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2200);
    };

    if (hero.isPublic === false) return null;

    const stats = hero.stats?.length ? hero.stats : [
        { value: "3+", label: "Years Exp." },
        { value: "40+", label: "Projects" },
        { value: "15+", label: "Clients" },
        { value: "∞", label: "Coffee ☕" },
    ];

    const techPills = hero.techPills?.length ? hero.techPills : ["React", "Node.js", "TypeScript", "Figma", "Python", "Java"];

    // Dynamic styles configured from admin
    const layoutStyle = hero.layoutStyle || "glassmorphism"; // 'glassmorphism' | 'split' | 'editorial' | 'hologram' | 'inline' | 'stacked'
    const accent = hero.accentColor || "#e84545";
    const accent2 = hero.secondaryAccentColor || "#2e86de";
    const btnRadius = hero.buttonRadius || "10px";

    const fontMap = {
        'Comic Neue': "'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
        'Comic Sans MS': "'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
        'Syne': "'Syne', sans-serif",
        'Fira Code': "'Fira Code', monospace",
        'Outfit': "'Outfit', sans-serif",
        'Inter': "'Inter', sans-serif",
        'DM Sans': "'DM Sans', sans-serif"
    };

    const appliedFont = fontMap[hero.fontFamily] || hero.fontFamily || "'Comic Neue', 'Comic Sans MS', 'Syne', cursive, sans-serif";

    const customStyles = {
        ...(customBg ? { "--custom-bg": customBg } : {}),
        "--accent": accent,
        "--accent-2": accent2,
        "--btn-radius": btnRadius,
        "--hero-font": appliedFont
    };

    // Social icons renderer helper
    const socialElements = hero.showSocials !== false && (
        <div className="header__socials">
            {(hero.socialLinks?.length > 0 ? hero.socialLinks : [
                { label: 'GitHub', href: 'https://github.com', icon: 'fa-brands fa-github' },
                { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'fa-brands fa-linkedin' },
                { label: 'Twitter', href: 'https://twitter.com', icon: 'fa-brands fa-x-twitter' },
                { label: 'Email', href: 'mailto:mahadeb@portfolio.com', icon: 'fa-solid fa-envelope' }
            ]).map((s, i) => {
                const iconStr = s.icon || '';
                const label = (s.label || '').toLowerCase();

                let iconElement = <i className="fa-solid fa-link" />;
                if (iconStr.startsWith('fa-') || iconStr.includes('fa-')) {
                    iconElement = <i className={iconStr} />;
                } else if (label.includes('git') || iconStr === '⌥') {
                    iconElement = <i className="fa-brands fa-github" />;
                } else if (label.includes('link') || iconStr === 'in') {
                    iconElement = <i className="fa-brands fa-linkedin" />;
                } else if (label.includes('twit') || label.includes('x') || iconStr === '𝕏') {
                    iconElement = <i className="fa-brands fa-x-twitter" />;
                } else if (label.includes('mail') || iconStr === '✉') {
                    iconElement = <i className="fa-solid fa-envelope" />;
                } else if (iconStr) {
                    iconElement = <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{iconStr}</span>;
                }

                let href = (s.href || '').trim();
                const isMail = href.startsWith('mailto:') || label.includes('mail') || (href.includes('@') && !href.startsWith('http'));
                if (isMail && !href.startsWith('mailto:')) {
                    href = `mailto:${href}`;
                } else if (!isMail && href && !href.startsWith('http://') && !href.startsWith('https://')) {
                    href = `https://${href}`;
                }

                return (
                    <a
                        key={i}
                        href={href || '#'}
                        target={isMail ? '_self' : '_blank'}
                        rel={isMail ? undefined : 'noreferrer noopener'}
                        className="header__social"
                        title={s.label || (isMail ? 'Send Email' : 'Visit Profile')}
                    >
                        {iconElement}
                    </a>
                );
            })}
        </div>
    );

    // Stats strip renderer helper
    const statsElement = hero.showStats !== false && stats.length > 0 && (
        <div className="header__stats">
            {stats.map((s, i) => (
                <div key={i} className="header__stat">
                    <span className="header__stat-value">{s.value}</span>
                    <span className="header__stat-label">{s.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <header
            id="home"
            className={`header header--${bgPreset || "custom"} header--style-${layoutStyle} ${loaded ? "header--loaded" : ""}`}
            style={customStyles}
        >
            {/* ── Layered Background ── */}
            <div className="header__bg" aria-hidden="true">
                <div className="header__bg-layer header__bg-layer--1" />
                <div className="header__bg-layer header__bg-layer--2" />
                <div className="header__bg-layer header__bg-layer--3" />
                <div className="header__bg-grain" />
            </div>

            {hero.showParticles !== false && <Particles count={30} />}

            {/* ── Sticky Draggable Floating Background & Theme Widget ── */}
            <div
                className={`header__bg-picker-widget ${pickerOpen ? "header__bg-picker-widget--open" : ""}`}
                ref={widgetRef}
                style={widgetPos.x !== null ? { left: `${widgetPos.x}px`, top: `${widgetPos.y}px`, right: 'auto' } : {}}
            >
                <div
                    className="header__bg-trigger-pill"
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                    onClick={handleWidgetClick}
                    title="Drag anywhere or click to customize background"
                >
                    <span className="header__bg-drag-handle" title="Drag to move anywhere">
                        <i className="fa-solid fa-grip-vertical" />
                    </span>
                    <span className="header__bg-trigger-icon">⬡</span>
                    <span className="header__bg-trigger-label">Background</span>
                    <i className={`fa-solid fa-chevron-down header__bg-trigger-chevron ${pickerOpen ? "header__bg-trigger-chevron--open" : ""}`} />
                </div>

                {pickerOpen && (
                    <div className="header__bg-panel">
                        <div className="header__bg-panel-top">
                            <div className="header__bg-panel-title">
                                <i className="fa-solid fa-palette" style={{ color: "var(--accent)" }} />
                                <span>Theme Backdrop</span>
                            </div>
                            <span className="header__bg-panel-hint">Drag pill to move</span>
                        </div>

                        <div className="header__bg-grid">
                            {BG_PRESETS.map((p) => (
                                <button
                                    key={p.id}
                                    className={`header__bg-option header__bg-option--${p.id} ${bgPreset === p.id && !customBg ? "header__bg-option--active" : ""}`}
                                    onClick={() => selectPreset(p.id)}
                                    title={p.label}
                                >
                                    <span className="header__bg-option-icon">{p.icon}</span>
                                    <span className="header__bg-option-label">{p.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Custom color */}
                        <div className="header__bg-custom" ref={colorRef}>
                            <button
                                className={`header__bg-custom-btn ${customBg ? "header__bg-custom-btn--active" : ""}`}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                            >
                                <span
                                    className="header__bg-swatch"
                                    style={{ background: customColor }}
                                />
                                <span>Custom Color</span>
                            </button>
                            {showColorPicker && (
                                <div className="header__color-popup">
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="header__color-input"
                                    />
                                    <button className="header__color-apply" onClick={applyCustomColor}>
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════
               HERO LAYOUT STYLES SWITCHER
               ══════════════════════════════════════════════════════ */}

            {/* ── STYLE 1: Ultra-Modern Glassmorphic Floating Capsule ── */}
            {layoutStyle === "glassmorphism" && (
                <div className="header__glass-capsule">
                    <div className="header__glass-ambient" aria-hidden="true" />
                    
                    {hero.showBadge !== false && (
                        <div className="header__badge">
                            <span className="header__badge-dot" />
                            {hero.badgeText || "Available for work"}
                        </div>
                    )}

                    <div className="header__intro-inline">
                        {hero.showGreeting !== false && (
                            <span className="header__greeting-inline">{hero.greeting || "Hello, I'm"}</span>
                        )}
                        <h1 className="header__name-inline">
                            <span className="header__name-first">{hero.firstName || "MCA"} </span>
                            <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                        </h1>
                        {hero.showTypewriter !== false && (
                            <div className="header__role-inline">
                                <span className="header__role-prefix">{hero.rolePrefix || "—"}</span>
                                <span className="header__role-text">
                                    {displayed}
                                    <span className="header__cursor">|</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {hero.bio && <p className="header__bio">{hero.bio}</p>}

                    {hero.showTechStack !== false && techPills.length > 0 && (
                        <div className="header__stack">
                            {techPills.map((t, i) => (
                                <span key={i} className="header__pill">{t}</span>
                            ))}
                        </div>
                    )}

                    {hero.showCtas !== false && (
                        <div className="header__ctas">
                            <a
                                href={`#${hero.primaryCtaTarget || "projects"}`}
                                className="header__cta header__cta--primary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.primaryCtaText || "View My Work"}</span>
                                <i className="fa-solid fa-arrow-right header__cta-icon" />
                            </a>
                            <a
                                href={`#${hero.secondaryCtaTarget || "contact"}`}
                                className="header__cta header__cta--secondary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.secondaryCtaText || "Let's Talk"}</span>
                            </a>
                        </div>
                    )}

                    {socialElements}
                    {statsElement}
                </div>
            )}

            {/* ── STYLE 2: Two-Column Developer Split + Live Code IDE ── */}
            {layoutStyle === "split" && (
                <div className="header__split-container">
                    <div className="header__split-grid">
                        {/* Left Column: Intro & Actions */}
                        <div className="header__split-left">
                            {hero.showBadge !== false && (
                                <div className="header__badge" style={{ alignSelf: 'flex-start' }}>
                                    <span className="header__badge-dot" />
                                    {hero.badgeText || "Available for work"}
                                </div>
                            )}

                            {hero.showGreeting !== false && (
                                <p className="header__greeting" style={{ textAlign: 'left' }}>{hero.greeting || "Hello, I'm"}</p>
                            )}

                            <h1 className="header__name" style={{ textAlign: 'left' }}>
                                <span className="header__name-first">{hero.firstName || "MCA"} </span>
                                <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                            </h1>

                            {hero.showTypewriter !== false && (
                                <div className="header__role-wrap" style={{ justifyContent: 'flex-start' }}>
                                    <span className="header__role-prefix">{hero.rolePrefix || "I build"}</span>
                                    <span className="header__role-text">
                                        {displayed}
                                        <span className="header__cursor">|</span>
                                    </span>
                                </div>
                            )}

                            {hero.bio && <p className="header__bio" style={{ textAlign: 'left', maxWidth: '100%' }}>{hero.bio}</p>}

                            {hero.showTechStack !== false && techPills.length > 0 && (
                                <div className="header__stack" style={{ justifyContent: 'flex-start' }}>
                                    {techPills.map((t, i) => (
                                        <span key={i} className="header__pill">{t}</span>
                                    ))}
                                </div>
                            )}

                            {hero.showCtas !== false && (
                                <div className="header__ctas" style={{ justifyContent: 'flex-start' }}>
                                    <a
                                        href={`#${hero.primaryCtaTarget || "projects"}`}
                                        className="header__cta header__cta--primary"
                                        style={{ borderRadius: btnRadius }}
                                    >
                                        <span>{hero.primaryCtaText || "View My Work"}</span>
                                        <i className="fa-solid fa-arrow-right header__cta-icon" />
                                    </a>
                                    <a
                                        href={`#${hero.secondaryCtaTarget || "contact"}`}
                                        className="header__cta header__cta--secondary"
                                        style={{ borderRadius: btnRadius }}
                                    >
                                        <span>{hero.secondaryCtaText || "Let's Talk"}</span>
                                    </a>
                                </div>
                            )}

                            {socialElements}
                        </div>

                        {/* Right Column: Interactive Code IDE Window */}
                        <div className="header__split-right">
                            <div className="header__code-window">
                                <div className="header__code-header">
                                    <div className="header__code-dots">
                                        <span className="header__code-dot header__code-dot--red" />
                                        <span className="header__code-dot header__code-dot--yellow" />
                                        <span className="header__code-dot header__code-dot--green" />
                                    </div>
                                    <div className="header__code-tab">
                                        <i className="fa-brands fa-js" style={{ color: '#f7df1e' }} /> developer.ts
                                    </div>
                                    <button
                                        className="header__code-copy"
                                        onClick={copyDeveloperCode}
                                        title="Copy Code"
                                    >
                                        <i className={`fa-solid ${codeCopied ? 'fa-check' : 'fa-copy'}`} />
                                        <span>{codeCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>

                                <div className="header__code-body">
                                    <pre>
                                        <code>
                                            <span className="token-kw">const</span> <span className="token-var">developer</span> = &#123;{'\n'}
                                            {'  '}<span className="token-prop">name</span>: <span className="token-str">"{hero.firstName || 'Mahadeb'} {hero.lastName || 'Maity'}"</span>,{'\n'}
                                            {'  '}<span className="token-prop">role</span>: <span className="token-str">"{displayed || 'Full Stack Craftsman'}"</span>,{'\n'}
                                            {'  '}<span className="token-prop">coreStack</span>: [{'\n'}
                                            {'    '}{techPills.slice(0, 4).map((t, idx) => (
                                                <span key={idx}><span className="token-str">"{t}"</span>{idx < 3 ? ', ' : ''}</span>
                                            ))}{'\n'}
                                            {'  '}],{'\n'}
                                            {'  '}<span className="token-prop">status</span>: <span className="token-str">"Ready for high-impact projects 🚀"</span>,{'\n'}
                                            {'  '}<span className="token-prop">location</span>: <span className="token-str">"Haldia, WB, India 📍"</span>{'\n'}
                                            &#125;;
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {statsElement}
                </div>
            )}

            {/* ── STYLE 3: Minimalist Editorial Spotlight / Clean Modern ── */}
            {layoutStyle === "editorial" && (
                <div className="header__content header__content--editorial">
                    {hero.showBadge !== false && (
                        <div className="header__badge">
                            <span className="header__badge-dot" />
                            {hero.badgeText || "Available for work"}
                        </div>
                    )}

                    <h1 className="header__editorial-title">
                        {hero.firstName || "MCA"} <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                    </h1>

                    {hero.showTypewriter !== false && (
                        <p className="header__editorial-role">
                            {displayed}
                        </p>
                    )}

                    {hero.bio && <p className="header__bio">{hero.bio}</p>}

                    {hero.showTechStack !== false && techPills.length > 0 && (
                        <div className="header__stack">
                            {techPills.map((t, i) => (
                                <span key={i} className="header__pill">{t}</span>
                            ))}
                        </div>
                    )}

                    {hero.showCtas !== false && (
                        <div className="header__ctas">
                            <a
                                href={`#${hero.primaryCtaTarget || "projects"}`}
                                className="header__cta header__cta--primary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.primaryCtaText || "View My Work"}</span>
                                <i className="fa-solid fa-arrow-right header__cta-icon" />
                            </a>
                            <a
                                href={`#${hero.secondaryCtaTarget || "contact"}`}
                                className="header__cta header__cta--secondary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.secondaryCtaText || "Let's Talk"}</span>
                            </a>
                        </div>
                    )}

                    {socialElements}
                    {statsElement}
                </div>
            )}

            {/* ── STYLE 4: Retro-Futuristic Hologram Hub ── */}
            {layoutStyle === "hologram" && (
                <div className="header__hologram-wrap">
                    <div className="header__hologram-border" />
                    
                    {hero.showBadge !== false && (
                        <div className="header__badge header__badge--holo">
                            <i className="fa-solid fa-bolt" /> {hero.badgeText || "ONLINE & AVAILABLE"}
                        </div>
                    )}

                    <div className="header__intro-inline">
                        <h1 className="header__name-inline header__name-holo">
                            <span className="header__name-first">{hero.firstName || "MCA"} </span>
                            <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                        </h1>
                        {hero.showTypewriter !== false && (
                            <div className="header__role-inline">
                                <span className="header__role-prefix">//</span>
                                <span className="header__role-text">{displayed}<span className="header__cursor">_</span></span>
                            </div>
                        )}
                    </div>

                    {hero.bio && <p className="header__bio">{hero.bio}</p>}

                    {hero.showTechStack !== false && techPills.length > 0 && (
                        <div className="header__stack">
                            {techPills.map((t, i) => (
                                <span key={i} className="header__pill header__pill--holo">{t}</span>
                            ))}
                        </div>
                    )}

                    {hero.showCtas !== false && (
                        <div className="header__ctas">
                            <a
                                href={`#${hero.primaryCtaTarget || "projects"}`}
                                className="header__cta header__cta--primary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.primaryCtaText || "View My Work"}</span>
                                <i className="fa-solid fa-terminal" style={{ fontSize: '13px' }} />
                            </a>
                            <a
                                href={`#${hero.secondaryCtaTarget || "contact"}`}
                                className="header__cta header__cta--secondary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.secondaryCtaText || "Let's Talk"}</span>
                            </a>
                        </div>
                    )}

                    {socialElements}
                    {statsElement}
                </div>
            )}

            {/* ── Fallbacks for inline and stacked ── */}
            {(layoutStyle === "inline" || layoutStyle === "stacked") && (
                <div className={`header__content header__content--${layoutStyle}`}>
                    {hero.showBadge !== false && (
                        <div className="header__badge">
                            <span className="header__badge-dot" />
                            {hero.badgeText || "Available for work"}
                        </div>
                    )}

                    {layoutStyle === "inline" ? (
                        <div className="header__intro-inline">
                            {hero.showGreeting !== false && (
                                <span className="header__greeting-inline">{hero.greeting || "Hello, I'm"}</span>
                            )}
                            <h1 className="header__name-inline">
                                <span className="header__name-first">{hero.firstName || "MCA"} </span>
                                <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                            </h1>
                            {hero.showTypewriter !== false && (
                                <div className="header__role-inline">
                                    <span className="header__role-prefix">{hero.rolePrefix || "—"}</span>
                                    <span className="header__role-text">
                                        {displayed}
                                        <span className="header__cursor">|</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {hero.showGreeting !== false && (
                                <p className="header__greeting">{hero.greeting || "Hello, I'm"}</p>
                            )}
                            <h1 className="header__name">
                                <span className="header__name-first">{hero.firstName || "MCA"} </span>
                                <span className="header__name-last">{hero.lastName || "WALLAH"}</span>
                            </h1>
                            {hero.showTypewriter !== false && (
                                <div className="header__role-wrap">
                                    <span className="header__role-prefix">{hero.rolePrefix || "I build"}</span>
                                    <span className="header__role-text">
                                        {displayed}
                                        <span className="header__cursor">|</span>
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {hero.bio && <p className="header__bio">{hero.bio}</p>}

                    {hero.showTechStack !== false && techPills.length > 0 && (
                        <div className="header__stack">
                            {techPills.map((t, i) => (
                                <span key={i} className="header__pill">{t}</span>
                            ))}
                        </div>
                    )}

                    {hero.showCtas !== false && (
                        <div className="header__ctas">
                            <a
                                href={`#${hero.primaryCtaTarget || "projects"}`}
                                className="header__cta header__cta--primary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.primaryCtaText || "View My Work"}</span>
                                <i className="fa-solid fa-arrow-right header__cta-icon" />
                            </a>
                            <a
                                href={`#${hero.secondaryCtaTarget || "contact"}`}
                                className="header__cta header__cta--secondary"
                                style={{ borderRadius: btnRadius }}
                            >
                                <span>{hero.secondaryCtaText || "Let's Talk"}</span>
                            </a>
                        </div>
                    )}

                    {socialElements}
                    {statsElement}
                </div>
            )}

            {/* ── Scroll Down Indicator ── */}
            <button className="header__scroll-indicator" onClick={scrollDown} title="Scroll down">
                <span className="header__scroll-track">
                    <span className="header__scroll-dot" />
                </span>
                <span className="header__scroll-text">SCROLL</span>
            </button>
        </header>
    );
}
