import { useState, useEffect, useRef } from "react";
import "./Header.css";

// ── Background presets ──
const BG_PRESETS = [
    { id: "mesh", label: "Mesh", icon: "◈" },
    { id: "aurora", label: "Aurora", icon: "◉" },
    { id: "grid", label: "Grid", icon: "⊞" },
    { id: "dots", label: "Dots", icon: "⁙" },
    { id: "noise", label: "Noise", icon: "▒" },
    { id: "minimal", label: "Minimal", icon: "—" },
];

// ── Typing loop ──
const ROLES = [
    "Full Stack Developer",
    "UI/UX Enthusiast",
    "Open Source Contributor",
    "Problem Solver",
    "React Craftsman",
];

// ── Floating particles ──
function Particles({ count = 28 }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        dur: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.1,
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
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                        animationDuration: `${p.dur}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function Header() {
    const [bgPreset, setBgPreset] = useState("mesh");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [customBg, setCustomBg] = useState(null); // custom color/gradient
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customColor, setCustomColor] = useState("#0f0f1a");
    const pickerRef = useRef(null);
    const colorRef = useRef(null);

    // Mount animation
    useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

    // Close pickers on outside click
    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
            if (colorRef.current && !colorRef.current.contains(e.target)) setShowColorPicker(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Typewriter
    useEffect(() => {
        const current = ROLES[roleIndex];
        let timeout;
        if (!isDeleting && displayed.length < current.length) {
            timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
        } else if (!isDeleting && displayed.length === current.length) {
            timeout = setTimeout(() => setIsDeleting(true), 1800);
        } else if (isDeleting && displayed.length > 0) {
            timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
        } else if (isDeleting && displayed.length === 0) {
            setIsDeleting(false);
            setRoleIndex((i) => (i + 1) % ROLES.length);
        }
        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, roleIndex]);

    const applyCustomColor = () => {
        setCustomBg(customColor);
        setBgPreset(null);
        setShowColorPicker(false);
        setPickerOpen(false);
    };

    const selectPreset = (id) => {
        setBgPreset(id);
        setCustomBg(null);
        setPickerOpen(false);
    };

    // Scroll down helper
    const scrollDown = () => {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    };

    return (
        <header
            id="home"
            className={`header header--${bgPreset || "custom"} ${loaded ? "header--loaded" : ""}`}
            style={customBg ? { "--custom-bg": customBg } : {}}
        >
            {/* ── Layered Background ── */}
            <div className="header__bg" aria-hidden="true">
                <div className="header__bg-layer header__bg-layer--1" />
                <div className="header__bg-layer header__bg-layer--2" />
                <div className="header__bg-layer header__bg-layer--3" />
                <div className="header__bg-grain" />
            </div>

            <Particles count={30} />

            {/* ── Background Picker (top-right) ── */}
            <div className="header__bg-picker" ref={pickerRef}>
                <button
                    className="header__bg-trigger"
                    onClick={() => setPickerOpen(!pickerOpen)}
                    title="Change background"
                >
                    <span className="header__bg-trigger-icon">⬡</span>
                    <span className="header__bg-trigger-label">Background</span>
                </button>

                {pickerOpen && (
                    <div className="header__bg-panel">
                        <p className="header__bg-panel-title">Choose Style</p>
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
                                Custom Color
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

            {/* ── Hero Content ── */}
            <div className="header__content">

                {/* Badge */}
                <div className="header__badge">
                    <span className="header__badge-dot" />
                    Available for work
                </div>

                {/* Greeting */}
                <p className="header__greeting">Hello, I'm</p>

                {/* Name */}
                <h1 className="header__name">
                    <span className="header__name-first">MCA </span>
                    <span className="header__name-last">WALLAH</span>
                </h1>

                {/* Typewriter Role */}
                <div className="header__role-wrap">
                    <span className="header__role-prefix">I build</span>
                    <span className="header__role-text">
                        {displayed}
                        <span className="header__cursor">|</span>
                    </span>
                </div>

                {/* Bio */}
                <p className="header__bio">
                    I craft elegant digital experiences that live at the intersection of
                    design &amp; code. Passionate about building things that actually matter.
                </p>

                {/* Tech Stack Pills */}
                <div className="header__stack">
                    {["React", "Node.js", "TypeScript", "Figma", "Python"].map((tech) => (
                        <span key={tech} className="header__pill">{tech}</span>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="header__ctas">
                    <button className="header__cta header__cta--primary" onClick={() => {
                        const el = document.getElementById("projects");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}>
                        View My Work
                        <span className="header__cta-arrow">→</span>
                    </button>
                    <button className="header__cta header__cta--secondary" onClick={() => {
                        const el = document.getElementById("contact");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}>
                        Let's Talk
                    </button>
                </div>

                {/* Social Links */}
                <div className="header__socials">
                    {[
                        { label: "GitHub", href: "https://github.com", icon: "⌥" },
                        { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
                        { label: "Twitter", href: "https://twitter.com", icon: "𝕏" },
                        { label: "Email", href: "mailto:you@email.com", icon: "✉" },
                    ].map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="header__social"
                            title={s.label}
                        >
                            <span className="header__social-icon">{s.icon}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className="header__stats">
                {[
                    { value: "3+", label: "Years Exp." },
                    { value: "40+", label: "Projects" },
                    { value: "15+", label: "Clients" },
                    { value: "∞", label: "Coffee ☕" },
                ].map((s) => (
                    <div key={s.label} className="header__stat">
                        <strong className="header__stat-value">{s.value}</strong>
                        <span className="header__stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Scroll Down ── */}
            <button className="header__scroll-down" onClick={scrollDown} aria-label="Scroll down">
                <span className="header__scroll-dot" />
            </button>
        </header>
    );
}
