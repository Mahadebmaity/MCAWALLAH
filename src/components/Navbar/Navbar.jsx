import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePortfolioData } from "../../context/DataContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Navbar.css";

const DEFAULT_NAV_LINKS = [
    { id: "home", label: "Home", icon: "fa-solid fa-house" },
    { id: "about", label: "About", icon: "fa-solid fa-circle-user" },
    { id: "projects", label: "Projects", icon: "fa-solid fa-folder-open" },
    { id: "fun-game", label: "Fun Game", icon: "fa-solid fa-gamepad" },
    { id: "contact", label: "Get in Touch", icon: "fa-solid fa-handshake" },
];

export default function Navbar() {
    const {
        user, logout, savePreferences,
        uploadAvatar, removeAvatar,
        updateProfile, changePassword,
    } = useAuth();

    const { data } = usePortfolioData();
    const about = data?.about || {};
    const navbarConfig = data?.navbar || {};

    /* ── Configuration from Admin CMS ── */
    const layoutStyle = navbarConfig.layoutStyle || "floating-dock"; // 'floating-dock' | 'cyber-capsule' | 'minimal-island' | 'full-width'
    const logoText = navbarConfig.logoText || "Mahadeb";
    const logoPrefix = navbarConfig.logoPrefix !== undefined ? navbarConfig.logoPrefix : "<";
    const logoSuffix = navbarConfig.logoSuffix !== undefined ? navbarConfig.logoSuffix : "/>";
    const showLogoPulse = navbarConfig.showLogoPulse !== false;
    const showStatusBadge = navbarConfig.showStatusBadge || false;
    const statusBadgeText = navbarConfig.statusBadgeText || "Available for work";
    const showThemeToggle = navbarConfig.showThemeToggle !== false;
    const showResumeButton = navbarConfig.showResumeButton !== false;
    const showHireMeButton = navbarConfig.showHireMeButton || false;
    const hireMeButtonText = navbarConfig.hireMeButtonText || "Let's Talk";
    const hireMeStyle = navbarConfig.hireMeStyle || "gradient-glow"; // 'gradient-glow' | 'cyber-outline' | 'glassmorphic-pill' | 'accent-solid'
    const hireMeIcon = navbarConfig.hireMeIcon !== undefined ? navbarConfig.hireMeIcon : "fa-solid fa-paper-plane";
    const hireMeTarget = navbarConfig.hireMeTarget || "contact";

    const activeNavLinks = (navbarConfig.navLinks?.length > 0)
        ? navbarConfig.navLinks.filter(l => l.isVisible !== false)
        : DEFAULT_NAV_LINKS;

    /* ── UI state ── */
    const [darkMode, setDarkMode] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    const [resumeDropdown, setResumeDropdown] = useState(false);
    const [activePanel, setActivePanel] = useState(null); // "profile"|"avatar"|"prefs"|"password"
    const [panelOpen, setPanelOpen] = useState(false);

    /* ── form state ── */
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [profileMsg, setProfileMsg] = useState(null);
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [pwMsg, setPwMsg] = useState(null);
    const [avatarStatus, setAvatarStatus] = useState(null);
    const [prefs, setPrefs] = useState({ background: "mesh", accentColor: "#e84545" });
    const [prefsMsg, setPrefsMsg] = useState(null);

    const dropdownRef = useRef(null);
    const resumeRef = useRef(null);
    const fileRef = useRef(null);

    /* ── sync prefs from logged-in user ── */
    useEffect(() => {
        if (user?.preferences) {
            setDarkMode(user.preferences.darkMode ?? true);
            setPrefs({
                background: user.preferences.background || "mesh",
                accentColor: user.preferences.accentColor || "#e84545",
            });
        }
    }, [user]);

    /* ── apply dark mode to <html> ── */
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    /* ── scroll listener ── */
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    /* ── active section tracker ── */
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveLink(e.target.id); }),
            { threshold: 0.35 }
        );
        activeNavLinks.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, [activeNavLinks]);

    /* ── close dropdowns on outside click ── */
    useEffect(() => {
        const fn = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdown(false);
                closePanel();
            }
            if (resumeRef.current && !resumeRef.current.contains(e.target)) {
                setResumeDropdown(false);
            }
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    /* ── panel open/close ── */
    const openPanel = (name) => {
        if (name === "profile") setProfileForm({ name: user?.name || "", email: user?.email || "" });
        setActivePanel(name);
        setTimeout(() => setPanelOpen(true), 10);
    };
    const closePanel = () => {
        setPanelOpen(false);
        setTimeout(() => setActivePanel(null), 350);
    };

    /* ── smooth scroll nav ── */
    const navClick = (id) => {
        setActiveLink(id);
        setMenuOpen(false);
        const targetId = (id === "get-in-touch" || id === "contact") ? "contact" : id;
        const el = document.getElementById(targetId) || document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    /* ── dark mode toggle + save to backend ── */
    const toggleDark = async () => {
        const next = !darkMode;
        setDarkMode(next);
        if (user) {
            try { await savePreferences({ darkMode: next }); } catch { }
        }
    };

    /* ── Dynamic Multi-Resume Management ── */
    const visibleResumes = (about.resumes?.length > 0)
        ? about.resumes.filter(r => r.isVisible !== false).slice(0, 3)
        : (about.resumeUrl ? [{ title: about.resumeLabel || "Resume", url: about.resumeUrl }] : []);

    const primaryResume = visibleResumes.find(r => r.isDefault) || visibleResumes[0] || {
        title: about.resumeLabel || "Resume",
        url: about.resumeUrl || "/resume.pdf"
    };

    const primaryButtonLabel = navbarConfig.resumeButtonText || about.resumeLabel || primaryResume.title || "Resume";

    const downloadResume = (resumeItem, e) => {
        if (e) e.stopPropagation();
        const item = resumeItem || primaryResume;
        const targetUrl = item?.url || about.resumeUrl || "/resume.pdf";

        const a = document.createElement("a");
        a.href = targetUrl;
        a.setAttribute("download", (item?.title || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf");
        a.target = "_blank";
        a.rel = "noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setResumeDropdown(false);
    };

    /* ── logout ── */
    const handleLogout = async () => {
        setDropdown(false);
        closePanel();
        await logout();
    };

    /* ── save profile ── */
    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileMsg(null);
        try {
            await updateProfile(profileForm);
            setProfileMsg({ ok: true, text: "Profile updated!" });
        } catch (err) {
            setProfileMsg({ ok: false, text: err.message });
        }
    };

    /* ── change password ── */
    const savePassword = async (e) => {
        e.preventDefault();
        setPwMsg(null);
        if (pwForm.next !== pwForm.confirm) { setPwMsg({ ok: false, text: "Passwords don't match" }); return; }
        if (pwForm.next.length < 6) { setPwMsg({ ok: false, text: "Min 6 characters" }); return; }
        try {
            await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
            setPwMsg({ ok: true, text: "Password changed!" });
            setPwForm({ current: "", next: "", confirm: "" });
        } catch (err) {
            setPwMsg({ ok: false, text: err.message });
        }
    };

    /* ── avatar upload / remove ── */
    const handleAvatarFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarStatus("Uploading...");
        try {
            await uploadAvatar(file);
            setAvatarStatus("Avatar updated!");
        } catch (err) {
            setAvatarStatus(`Error: ${err.message}`);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarStatus("Removing...");
        try {
            await removeAvatar();
            setAvatarStatus("Avatar removed!");
        } catch (err) {
            setAvatarStatus(`Error: ${err.message}`);
        }
    };

    /* ── save preferences ── */
    const savePrefs = async (e) => {
        e.preventDefault();
        setPrefsMsg(null);
        try {
            await savePreferences(prefs);
            setPrefsMsg({ ok: true, text: "Preferences saved!" });
        } catch (err) {
            setPrefsMsg({ ok: false, text: err.message });
        }
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "U";

    const avatarSrc = user?.avatarUrl || null;

    if (navbarConfig.isPublic === false) return null;

    const dynamicNavStyles = {
        "--nav-accent": navbarConfig.accentColor || "#e84545",
        "--nav-radius": navbarConfig.borderRadius || "999px",
        "--nav-blur": navbarConfig.blurStrength || "24px"
    };

    return (
        <>
            {/* ════════════ NAVBAR ════════════ */}
            <header className={`navbar-wrapper navbar-wrapper--${layoutStyle} ${scrolled ? "navbar-wrapper--scrolled" : ""}`} style={dynamicNavStyles}>
                <nav className={`navbar navbar--${layoutStyle} ${scrolled ? "navbar--scrolled" : ""}`}>

                    {/* Logo & Brand */}
                    <div className="navbar__logo" onClick={() => navClick("home")} title="Scroll to top">
                        {logoPrefix && <span className="navbar__logo-bracket">{logoPrefix}</span>}
                        <span className="navbar__logo-name">{logoText}</span>
                        {logoSuffix && <span className="navbar__logo-bracket">{logoSuffix}</span>}
                        {showLogoPulse && <span className="navbar__logo-dot" />}
                    </div>

                    {/* Status Badge (Optional) */}
                    {showStatusBadge && (
                        <div className="navbar__status-pill">
                            <span className="navbar__status-dot" />
                            <span>{statusBadgeText}</span>
                        </div>
                    )}

                    {/* Desktop Nav Links */}
                    <ul className="navbar__links">
                        {activeNavLinks.map((l) => (
                            <li key={l.id}>
                                <button
                                    className={`navbar__link ${activeLink === l.id ? "navbar__link--active" : ""}`}
                                    onClick={() => navClick(l.id)}
                                >
                                    {l.icon && <i className={l.icon} />}
                                    <span>{l.label}</span>
                                    <span className="navbar__link-bar" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Right Actions */}
                    <div className="navbar__actions">

                        {/* Resume Action / Multi-Version Dropdown */}
                        {showResumeButton && visibleResumes.length > 0 && (
                            <div className="navbar__resume-wrapper" ref={resumeRef}>
                                {visibleResumes.length === 1 ? (
                                    <button
                                        className="navbar__resume-btn"
                                        onClick={(e) => downloadResume(primaryResume, e)}
                                        title={`Download ${primaryButtonLabel}`}
                                    >
                                        <i className="fa-solid fa-download" />
                                        <span className="navbar__resume-text">{primaryButtonLabel}</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className={`navbar__resume-btn ${resumeDropdown ? "navbar__resume-btn--active" : ""}`}
                                            onClick={() => setResumeDropdown(!resumeDropdown)}
                                            title="View Available Resumes"
                                        >
                                            <i className="fa-solid fa-file-pdf" />
                                            <span className="navbar__resume-text">{primaryButtonLabel}</span>
                                            <span className="navbar__resume-badge">{visibleResumes.length}</span>
                                            <i className={`fa-solid fa-chevron-down navbar__resume-arrow ${resumeDropdown ? "navbar__resume-arrow--open" : ""}`} />
                                        </button>

                                        {resumeDropdown && (
                                            <div className="navbar__resume-dropdown">
                                                <div className="navbar__resume-dropdown-header">
                                                    <span>Available Resumes</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{visibleResumes.length} versions</span>
                                                </div>
                                                <div className="navbar__resume-dropdown-list">
                                                    {visibleResumes.map((r, idx) => (
                                                        <div key={idx} className="navbar__resume-dropdown-item">
                                                            <div className="navbar__resume-dropdown-info">
                                                                <i className="fa-solid fa-file-pdf" />
                                                                <span className="navbar__resume-dropdown-title">{r.title || r.fileName || `Resume ${idx + 1}`}</span>
                                                            </div>
                                                            <div className="navbar__resume-dropdown-actions">
                                                                <a
                                                                    href={r.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="navbar__resume-icon-btn"
                                                                    title="Preview Online"
                                                                    onClick={() => setResumeDropdown(false)}
                                                                >
                                                                    <i className="fa-solid fa-arrow-up-right-from-square" />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    className="navbar__resume-icon-btn navbar__resume-icon-btn--dl"
                                                                    title="Download File"
                                                                    onClick={(e) => downloadResume(r, e)}
                                                                >
                                                                    <i className="fa-solid fa-download" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* "Let's Talk" / "Hire Me" Direct CTA */}
                        {showHireMeButton && (
                            <button
                                className={`navbar__cta-btn navbar__cta-btn--${hireMeStyle}`}
                                onClick={() => navClick(hireMeTarget || "contact")}
                            >
                                <span>{hireMeButtonText || "Let's Talk"}</span>
                                {hireMeIcon && hireMeIcon !== 'none' && (
                                    <i className={hireMeIcon} style={{ fontSize: '11px' }} />
                                )}
                            </button>
                        )}

                        {/* Dark / Light Toggle */}
                        {showThemeToggle && (
                            <button className="navbar__theme-toggle" onClick={toggleDark} title="Toggle theme">
                                <div className="navbar__toggle-track">
                                    <span className="navbar__toggle-sun"><i className="fa-solid fa-sun" /></span>
                                    <span className="navbar__toggle-moon"><i className="fa-solid fa-moon" /></span>
                                    <div className={`navbar__toggle-thumb ${darkMode ? "navbar__toggle-thumb--dark" : ""}`} />
                                </div>
                            </button>
                        )}

                        {/* ── Logged IN User ── */}
                        {user ? (
                            <div className="navbar__user" ref={dropdownRef}>
                                <button
                                    className={`navbar__avatar-btn ${dropdown ? "navbar__avatar-btn--open" : ""}`}
                                    onClick={() => { setDropdown(!dropdown); if (dropdown) closePanel(); }}
                                >
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt={user.name} className="navbar__avatar-img" />
                                        : <span className="navbar__avatar-initials">{initials}</span>
                                    }
                                    <i className={`fa-solid fa-chevron-down navbar__avatar-arrow ${dropdown ? "navbar__avatar-arrow--up" : ""}`} />
                                </button>

                                {/* Dropdown */}
                                <div className={`navbar__dropdown ${dropdown ? "navbar__dropdown--open" : ""}`}>
                                    <div className="navbar__dropdown-header">
                                        <div className="navbar__dropdown-avatar">
                                            {avatarSrc
                                                ? <img src={avatarSrc} alt={user.name} />
                                                : <span>{initials}</span>
                                            }
                                            <span className="navbar__dropdown-online" />
                                        </div>
                                        <div>
                                            <p className="navbar__dropdown-name">{user.name}</p>
                                            <p className="navbar__dropdown-email">{user.email}</p>
                                            <span className="navbar__dropdown-role">{user.role}</span>
                                        </div>
                                    </div>

                                    <div className="navbar__dropdown-divider" />

                                    {/* Admin Studio Quick Link */}
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={() => setDropdown(false)}
                                            className="navbar__dropdown-item"
                                            style={{ color: 'var(--adm-primary, #38bdf8)', textDecoration: 'none' }}
                                        >
                                            <i className="fa-solid fa-gauge-high" />
                                            <span>Admin Studio CMS</span>
                                            <i className="fa-solid fa-chevron-right navbar__dropdown-item-arrow" />
                                        </Link>
                                    )}

                                    {[
                                        { key: "profile", icon: "fa-solid fa-pen-to-square", label: "Edit Profile" },
                                        { key: "avatar", icon: "fa-solid fa-camera", label: "Change Avatar / DP" },
                                        { key: "prefs", icon: "fa-solid fa-sliders", label: "Preferences" },
                                        { key: "password", icon: "fa-solid fa-lock", label: "Change Password" },
                                    ].map(({ key, icon, label }) => (
                                        <button
                                            key={key}
                                            className={`navbar__dropdown-item ${activePanel === key ? "navbar__dropdown-item--active" : ""}`}
                                            onClick={() => openPanel(key)}
                                        >
                                            <i className={icon} />
                                            <span>{label}</span>
                                            <i className="fa-solid fa-chevron-right navbar__dropdown-item-arrow" />
                                        </button>
                                    ))}

                                    <div className="navbar__dropdown-divider" />

                                    <button className="navbar__dropdown-item navbar__dropdown-item--logout" onClick={handleLogout}>
                                        <i className="fa-solid fa-arrow-right-from-bracket" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="navbar__signin-btn" onClick={() => setShowAuth(true)}>
                                <i className="fa-solid fa-right-to-bracket" /> Sign In
                            </button>
                        )}

                        {/* Hamburger */}
                        <button
                            className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>

                    {/* ── Mobile Drawer ── */}
                    <div className={`navbar__drawer ${menuOpen ? "navbar__drawer--open" : ""}`}>
                        <ul className="navbar__drawer-links">
                            {activeNavLinks.map((l) => (
                                <li key={l.id}>
                                    <button
                                        className={`navbar__drawer-link ${activeLink === l.id ? "navbar__drawer-link--active" : ""}`}
                                        onClick={() => navClick(l.id)}
                                    >
                                        {l.icon && <i className={l.icon} />} {l.label}
                                    </button>
                                </li>
                            ))}
                            {showResumeButton && visibleResumes.map((r, idx) => (
                                <li key={`resume-${idx}`}>
                                    <button
                                        className="navbar__drawer-link navbar__drawer-resume"
                                        onClick={(e) => { setMenuOpen(false); downloadResume(r, e); }}
                                    >
                                        <i className="fa-solid fa-download" /> {r.title || primaryButtonLabel}
                                    </button>
                                </li>
                            ))}
                            {showHireMeButton && (
                                <li>
                                    <button
                                        className="navbar__drawer-link navbar__drawer-cta"
                                        onClick={() => navClick(hireMeTarget || "contact")}
                                    >
                                        <i className="fa-solid fa-paper-plane" /> {hireMeButtonText || "Let's Talk"}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {menuOpen && <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />}
                </nav>
            </header>

            {/* Auth Modal */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
