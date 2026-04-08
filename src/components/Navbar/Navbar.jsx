import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

export default function Navbar() {
    const [darkMode, setDarkMode] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("home");
    const [userDropdown, setUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Dark mode toggle on <html>
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const navLinks = [
        { id: "home", label: "Home", icon: "⌂" },
        { id: "about", label: "About", icon: "◉" },
        { id: "projects", label: "Projects", icon: "⬡" },
        { id: "fun-game", label: "Fun Game", icon: "◈" },
        { id: "contact", label: "Contact", icon: "◎" },
        { id: "get-in-touch", label: "Get in Touch", icon: "→" },
    ];

    const handleNavClick = (id) => {
        setActiveLink(id);
        setMenuOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const handleResumeDownload = () => {
        // Replace with your actual resume URL
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "My_Resume.pdf";
        link.click();
    };

    return (
        <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${darkMode ? "dark" : ""}`}>
            {/* ── LOGO ── */}
            <div className="navbar__logo" onClick={() => handleNavClick("home")}>
                <span className="navbar__logo-bracket">{`{(*`}</span> {/* &lt;*/}
                <span className="navbar__logo-name">Mahadeb</span>
                <span className="navbar__logo-bracket">{`*)}`}</span> {/* /&lt;*/}
                <span className="navbar__logo-dot"></span>
            </div>

            {/* ── DESKTOP LINKS ── */}
            <ul className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
                {navLinks.map((link) => (
                    <li key={link.id} className="navbar__item">
                        <button
                            className={`navbar__link ${activeLink === link.id ? "navbar__link--active" : ""}`}
                            onClick={() => handleNavClick(link.id)}
                        >
                            <span className="navbar__link-icon">{link.icon}</span>
                            <span className="navbar__link-label">{link.label}</span>
                            <span className="navbar__link-underline"></span>
                        </button>
                    </li>
                ))}
            </ul>

            {/* ── RIGHT ACTIONS ── */}
            <div className="navbar__actions">

                {/* Resume Download */}
                <button className="navbar__resume-btn" onClick={handleResumeDownload} title="Download Resume">
                    <span className="navbar__resume-icon">↓</span>
                    <span className="navbar__resume-text">Resume</span>
                </button>

                {/* Dark / Light Toggle */}
                <button
                    className="navbar__theme-toggle"
                    onClick={() => setDarkMode(!darkMode)}
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle theme"
                >
                    <div className="navbar__toggle-track">
                        <span className="navbar__toggle-sun">☀</span>
                        <span className="navbar__toggle-moon">☽</span>
                        <div className={`navbar__toggle-thumb ${darkMode ? "navbar__toggle-thumb--dark" : ""}`}></div>
                    </div>
                </button>

                {/* Auth Section */}
                {isLoggedIn ? (
                    <div className="navbar__user" ref={dropdownRef}>
                        <button
                            className="navbar__avatar"
                            onClick={() => setUserDropdown(!userDropdown)}
                            title="Account"
                        >
                            <span className="navbar__avatar-initials">DP</span>
                            <span className="navbar__avatar-ping"></span>
                        </button>
                        {userDropdown && (
                            <div className="navbar__dropdown">
                                <div className="navbar__dropdown-header">
                                    <strong>YourName</strong>
                                    <small>your@email.com</small>
                                </div>
                                <hr className="navbar__dropdown-divider" />
                                <button className="navbar__dropdown-item">⚙ Profile Settings</button>
                                <button className="navbar__dropdown-item">◈ Dashboard</button>
                                <hr className="navbar__dropdown-divider" />
                                <button
                                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                                    onClick={() => { setIsLoggedIn(false); setUserDropdown(false); }}
                                >
                                    ⏻ Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className="navbar__signin-btn"
                        onClick={() => setIsLoggedIn(true)}
                    >
                        Sign In
                    </button>
                )}

                {/* Hamburger */}
                <button
                    className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* ── MOBILE DRAWER ── */}
            <div className={`navbar__drawer ${menuOpen ? "navbar__drawer--open" : ""}`}>
                <ul className="navbar__drawer-links">
                    {navLinks.map((link) => (
                        <li key={link.id}>
                            <button
                                className={`navbar__drawer-link ${activeLink === link.id ? "navbar__drawer-link--active" : ""}`}
                                onClick={() => handleNavClick(link.id)}
                            >
                                <span>{link.icon}</span> {link.label}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button className="navbar__drawer-link navbar__drawer-resume" onClick={handleResumeDownload}>
                            ↓ Download Resume
                        </button>
                    </li>
                </ul>
            </div>

            {/* Backdrop */}
            {menuOpen && <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />}
        </nav>
    );
}
