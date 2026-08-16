import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePortfolioData } from "../../context/DataContext";
import { trackActivity } from "../../utils/analytics";
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
        setDropdown(false);
        if (name === "profile") setProfileForm({ name: user?.name || "", email: user?.email || "" });
        if (name === "prefs" && user?.preferences) {
            setPrefs({
                darkMode: user.preferences.darkMode !== undefined ? user.preferences.darkMode : true,
                background: user.preferences.background || "mesh",
                accentColor: user.preferences.accentColor || "#e84545"
            });
        }
        setActivePanel(name);
        setPanelOpen(true);
    };
    const closePanel = () => {
        setPanelOpen(false);
        setActivePanel(null);
        setProfileMsg(null);
        setPrefsMsg(null);
        setPwMsg(null);
        setAvatarStatus(null);
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
        const title = item?.title || "Resume";

        trackActivity({
            action: 'RESUME_DOWNLOAD',
            category: 'document',
            details: `Downloaded resume: "${title}"`
        });

        const a = document.createElement("a");
        a.href = targetUrl;
        a.setAttribute("download", title.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf");
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

            {/* ══ User Account Settings Modal (Profile, Avatar, Prefs, Password) ══ */}
            {activePanel && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePanel();
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '20px',
                            maxWidth: '520px',
                            width: '100%',
                            padding: '26px',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
                            color: '#fff'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    {activePanel === 'profile' && <i className="fa-solid fa-pen-to-square" />}
                                    {activePanel === 'avatar' && <i className="fa-solid fa-camera" />}
                                    {activePanel === 'prefs' && <i className="fa-solid fa-sliders" />}
                                    {activePanel === 'password' && <i className="fa-solid fa-lock" />}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                                        {activePanel === 'profile' && 'Edit Profile'}
                                        {activePanel === 'avatar' && 'Change Avatar / DP'}
                                        {activePanel === 'prefs' && 'Account Preferences'}
                                        {activePanel === 'password' && 'Change Password'}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        Manage your personal credentials &amp; experience
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closePanel}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
                            {[
                                { key: 'profile', icon: 'fa-solid fa-user', label: 'Profile' },
                                { key: 'avatar', icon: 'fa-solid fa-camera', label: 'Avatar' },
                                { key: 'prefs', icon: 'fa-solid fa-sliders', label: 'Preferences' },
                                { key: 'password', icon: 'fa-solid fa-lock', label: 'Password' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => openPanel(tab.key)}
                                    style={{
                                        flex: 1,
                                        minWidth: '90px',
                                        padding: '7px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        background: activePanel === tab.key ? 'var(--adm-primary, #38bdf8)' : 'transparent',
                                        color: activePanel === tab.key ? '#090d16' : '#94a3b8',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <i className={tab.icon} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* ── Tab 1: Edit Profile ── */}
                        {activePanel === 'profile' && (
                            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="adm-input"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        placeholder="name@domain.com"
                                        required
                                    />
                                </div>

                                {profileMsg && (
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: profileMsg.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: profileMsg.ok ? '#34d399' : '#f87171',
                                        border: `1px solid ${profileMsg.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                    }}>
                                        {profileMsg.text}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                                    <button type="button" onClick={closePanel} className="adm-btn adm-btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="adm-btn adm-btn-primary">
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Tab 2: Change Avatar ── */}
                        {activePanel === 'avatar' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    border: '3px solid #38bdf8',
                                    overflow: 'hidden',
                                    background: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
                                }}>
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8' }}>{initials}</span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="navbar-avatar-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarFile}
                                    />
                                    <label
                                        htmlFor="navbar-avatar-upload"
                                        className="adm-btn adm-btn-primary"
                                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <i className="fa-solid fa-cloud-arrow-up" /> Upload Photo
                                    </label>

                                    {avatarSrc && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="adm-btn adm-btn-danger"
                                        >
                                            <i className="fa-solid fa-trash" /> Remove
                                        </button>
                                    )}
                                </div>

                                {avatarStatus && (
                                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>
                                        {avatarStatus}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab 3: Preferences ── */}
                        {activePanel === 'prefs' && (
                            <form onSubmit={savePrefs} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#cbd5e1' }}>
                                        Portfolio Accent Color
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={prefs.accentColor}
                                            onChange={(e) => setPrefs({ ...prefs, accentColor: e.target.value })}
                                            style={{ width: '44px', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            className="adm-input"
                                            value={prefs.accentColor}
                                            onChange={(e) => setPrefs({ ...prefs, accentColor: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#cbd5e1' }}>
                                        Hero Background Style
                                    </label>
                                    <select
                                        className="adm-select"
                                        value={prefs.background}
                                        onChange={(e) => setPrefs({ ...prefs, background: e.target.value })}
                                    >
                                        <option value="mesh">Mesh Gradient (Modern Glow)</option>
                                        <option value="cyber">Cyberpunk Matrix &amp; Particles</option>
                                        <option value="dots">Minimal Interactive Dots</option>
                                        <option value="clean">Deep Midnight Clean</option>
                                    </select>
                                </div>

                                {prefsMsg && (
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: prefsMsg.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: prefsMsg.ok ? '#34d399' : '#f87171',
                                        border: `1px solid ${prefsMsg.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                    }}>
                                        {prefsMsg.text}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                                    <button type="button" onClick={closePanel} className="adm-btn adm-btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="adm-btn adm-btn-primary">
                                        Save Preferences
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Tab 4: Change Password ── */}
                        {activePanel === 'password' && (
                            <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className="adm-input"
                                        value={pwForm.current}
                                        onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        New Password (min 6 characters)
                                    </label>
                                    <input
                                        type="password"
                                        className="adm-input"
                                        value={pwForm.next}
                                        onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="adm-input"
                                        value={pwForm.confirm}
                                        onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {pwMsg && (
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: pwMsg.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: pwMsg.ok ? '#34d399' : '#f87171',
                                        border: `1px solid ${pwMsg.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                    }}>
                                        {pwMsg.text}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                                    <button type="button" onClick={closePanel} className="adm-btn adm-btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="adm-btn adm-btn-primary">
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
