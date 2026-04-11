// src/components/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Navbar.css";

const NAV_LINKS = [
    { id: "home", label: "Home", icon: "fa-solid fa-house" },
    { id: "about", label: "About", icon: "fa-solid fa-circle-user" },
    { id: "projects", label: "Projects", icon: "fa-solid fa-folder-open" },
    { id: "fun-game", label: "Fun Game", icon: "fa-solid fa-gamepad" },
    { id: "contact", label: "Contact", icon: "fa-solid fa-envelope" },
    { id: "get-in-touch", label: "Get in Touch", icon: "fa-solid fa-handshake" },
];

const BG_PRESETS = ["mesh", "aurora", "grid", "dots", "noise", "minimal"];

export default function Navbar() {
    const {
        user, logout, savePreferences,
        uploadAvatar, removeAvatar,
        updateProfile, changePassword,
    } = useAuth();

    /* ── UI state ── */
    const [darkMode, setDarkMode] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [dropdown, setDropdown] = useState(false);
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
            { threshold: 0.4 }
        );
        NAV_LINKS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, []);

    /* ── close dropdown on outside click ── */
    useEffect(() => {
        const fn = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdown(false);
                closePanel();
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
        const el = document.getElementById(id);
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

    /* ── resume download ── */
    const downloadResume = () => {
        const a = document.createElement("a");
        a.href = "/resume.pdf"; a.download = "Resume.pdf"; a.click();
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

    /* ── avatar upload ── */
    const handleAvatarFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarStatus("uploading");
        try {
            await uploadAvatar(file);
            setAvatarStatus("ok");
            setTimeout(() => setAvatarStatus(null), 2500);
        } catch {
            setAvatarStatus("error");
        }
    };

    /* ── save preferences ── */
    const savePrefs = async () => {
        setPrefsMsg(null);
        try {
            await savePreferences({ ...prefs, darkMode });
            setPrefsMsg({ ok: true, text: "Preferences saved!" });
            setTimeout(() => setPrefsMsg(null), 2500);
        } catch (err) {
            setPrefsMsg({ ok: false, text: err.message });
        }
    };

    /* ── avatar display helpers ── */
    const avatarSrc = user?.avatar;
    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <>
            {/* ════════════ NAVBAR ════════════ */}
            <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>

                {/* Logo */}
                <div className="navbar__logo" onClick={() => navClick("home")}>
                    <span className="navbar__logo-bracket">&lt;</span>
                    <span className="navbar__logo-name">Mahadeb</span>
                    <span className="navbar__logo-bracket">/&gt;</span>
                    <span className="navbar__logo-dot" />
                </div>

                {/* Desktop nav links */}
                <ul className="navbar__links">
                    {NAV_LINKS.map((l) => (
                        <li key={l.id}>
                            <button
                                className={`navbar__link ${activeLink === l.id ? "navbar__link--active" : ""}`}
                                onClick={() => navClick(l.id)}
                            >
                                <i className={l.icon} />
                                <span>{l.label}</span>
                                <span className="navbar__link-bar" />
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Right actions */}
                <div className="navbar__actions">

                    {/* Resume download */}
                    <button className="navbar__resume-btn" onClick={downloadResume} title="Download Resume">
                        <i className="fa-solid fa-download" />
                        <span className="navbar__resume-text">Resume</span>
                    </button>

                    {/* Dark / Light toggle */}
                    <button className="navbar__theme-toggle" onClick={toggleDark} title="Toggle theme">
                        <div className="navbar__toggle-track">
                            <span className="navbar__toggle-sun"><i className="fa-solid fa-sun" /></span>
                            <span className="navbar__toggle-moon"><i className="fa-solid fa-moon" /></span>
                            <div className={`navbar__toggle-thumb ${darkMode ? "navbar__toggle-thumb--dark" : ""}`} />
                        </div>
                    </button>

                    {/* ── Logged IN ── */}
                    {user ? (
                        <div className="navbar__user" ref={dropdownRef}>

                            {/* Avatar button */}
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

                            {/* ── Dropdown ── */}
                            <div className={`navbar__dropdown ${dropdown ? "navbar__dropdown--open" : ""}`}>

                                {/* Header */}
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

                                {/* Menu items */}
                                {[
                                    { key: "profile", icon: "fa-solid fa-pen-to-square", label: "Edit Profile" },
                                    { key: "avatar", icon: "fa-solid fa-camera", label: "Change Avatar / DP" },
                                    { key: "prefs", icon: "fa-solid fa-sliders", label: "Preferences" },
                                    { key: "password", icon: "fa-solid fa-lock", label: "Change Password" },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        className={`navbar__dropdown-item ${activePanel === item.key ? "navbar__dropdown-item--active" : ""}`}
                                        onClick={() => activePanel === item.key ? closePanel() : openPanel(item.key)}
                                    >
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className={`fa-solid fa-chevron-right navbar__dropdown-item-arrow ${activePanel === item.key ? "navbar__dropdown-item-arrow--open" : ""}`} />
                                    </button>
                                ))}

                                <div className="navbar__dropdown-divider" />

                                <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                                    <i className="fa-solid fa-right-from-bracket" />
                                    <span>Sign Out</span>
                                </button>
                            </div>

                            {/* ── Slide Panels ── */}
                            {activePanel && (
                                <div className={`navbar__panel ${panelOpen ? "navbar__panel--open" : ""}`}>

                                    {/* Panel header */}
                                    <div className="navbar__panel-header">
                                        <button className="navbar__panel-back" onClick={closePanel}>
                                            <i className="fa-solid fa-arrow-left" />
                                        </button>
                                        <h3 className="navbar__panel-title">
                                            {activePanel === "profile" && "Edit Profile"}
                                            {activePanel === "avatar" && "Change Avatar"}
                                            {activePanel === "prefs" && "Preferences"}
                                            {activePanel === "password" && "Change Password"}
                                        </h3>
                                    </div>

                                    <div className="navbar__panel-body">

                                        {/* ── PROFILE ── */}
                                        {activePanel === "profile" && (
                                            <form onSubmit={saveProfile} className="navbar__panel-form">
                                                <div className="navbar__panel-group">
                                                    <label><i className="fa-solid fa-user" /> Name</label>
                                                    <input
                                                        type="text" value={profileForm.name} placeholder="Your name"
                                                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="navbar__panel-group">
                                                    <label><i className="fa-solid fa-envelope" /> Email</label>
                                                    <input
                                                        type="email" value={profileForm.email} placeholder="your@email.com"
                                                        onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                                                    />
                                                </div>
                                                {profileMsg && (
                                                    <p className={`navbar__panel-msg ${profileMsg.ok ? "navbar__panel-msg--ok" : "navbar__panel-msg--err"}`}>
                                                        <i className={`fa-solid ${profileMsg.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} />
                                                        {profileMsg.text}
                                                    </p>
                                                )}
                                                <button type="submit" className="navbar__panel-btn">
                                                    <i className="fa-solid fa-floppy-disk" /> Save Changes
                                                </button>
                                            </form>
                                        )}

                                        {/* ── AVATAR ── */}
                                        {activePanel === "avatar" && (
                                            <div className="navbar__avatar-panel">
                                                <div className="navbar__avatar-preview">
                                                    {avatarSrc
                                                        ? <img src={avatarSrc} alt="Current" />
                                                        : <div className="navbar__avatar-placeholder"><i className="fa-solid fa-user" /></div>
                                                    }
                                                </div>
                                                <button className="navbar__avatar-upload-btn" onClick={() => fileRef.current?.click()}>
                                                    <i className="fa-solid fa-cloud-arrow-up" />
                                                    {avatarStatus === "uploading" ? "Uploading…" : "Upload New Photo"}
                                                </button>
                                                <input
                                                    ref={fileRef} type="file" accept="image/*"
                                                    className="navbar__avatar-file-input"
                                                    onChange={handleAvatarFile}
                                                />
                                                {avatarStatus === "ok" && <p className="navbar__panel-msg navbar__panel-msg--ok"><i className="fa-solid fa-circle-check" /> Avatar updated!</p>}
                                                {avatarStatus === "error" && <p className="navbar__panel-msg navbar__panel-msg--err"><i className="fa-solid fa-circle-exclamation" /> Upload failed</p>}
                                                <p className="navbar__avatar-hint">
                                                    <i className="fa-solid fa-circle-info" /> JPEG, PNG, WEBP — max 5MB
                                                </p>
                                                {avatarSrc && (
                                                    <button className="navbar__panel-btn navbar__panel-btn--danger" onClick={removeAvatar}>
                                                        <i className="fa-solid fa-trash" /> Remove Photo
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* ── PREFERENCES ── */}
                                        {activePanel === "prefs" && (
                                            <div className="navbar__prefs-panel">
                                                <div className="navbar__pref-row">
                                                    <span><i className="fa-solid fa-circle-half-stroke" /> Dark Mode</span>
                                                    <button
                                                        className={`navbar__pref-toggle ${darkMode ? "navbar__pref-toggle--on" : ""}`}
                                                        onClick={toggleDark}
                                                    >
                                                        <span className="navbar__pref-toggle-thumb" />
                                                    </button>
                                                </div>

                                                <div className="navbar__pref-section">
                                                    <p className="navbar__pref-label"><i className="fa-solid fa-image" /> Background Style</p>
                                                    <div className="navbar__pref-bg-grid">
                                                        {BG_PRESETS.map((bg) => (
                                                            <button
                                                                key={bg}
                                                                className={`navbar__pref-bg-btn ${prefs.background === bg ? "navbar__pref-bg-btn--active" : ""}`}
                                                                onClick={() => setPrefs((p) => ({ ...p, background: bg }))}
                                                            >
                                                                {bg}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="navbar__pref-section">
                                                    <p className="navbar__pref-label"><i className="fa-solid fa-palette" /> Accent Color</p>
                                                    <div className="navbar__pref-colors">
                                                        {["#e84545", "#2e86de", "#27ae60", "#8e44ad", "#f39c12", "#16a085"].map((c) => (
                                                            <button
                                                                key={c}
                                                                className={`navbar__pref-color ${prefs.accentColor === c ? "navbar__pref-color--active" : ""}`}
                                                                style={{ background: c }}
                                                                onClick={() => setPrefs((p) => ({ ...p, accentColor: c }))}
                                                                title={c}
                                                            />
                                                        ))}
                                                        <input
                                                            type="color" value={prefs.accentColor}
                                                            onChange={(e) => setPrefs((p) => ({ ...p, accentColor: e.target.value }))}
                                                            className="navbar__pref-color-custom"
                                                            title="Custom color"
                                                        />
                                                    </div>
                                                </div>

                                                {prefsMsg && (
                                                    <p className={`navbar__panel-msg ${prefsMsg.ok ? "navbar__panel-msg--ok" : "navbar__panel-msg--err"}`}>
                                                        <i className={`fa-solid ${prefsMsg.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} />
                                                        {prefsMsg.text}
                                                    </p>
                                                )}
                                                <button className="navbar__panel-btn" onClick={savePrefs}>
                                                    <i className="fa-solid fa-floppy-disk" /> Save Preferences
                                                </button>
                                            </div>
                                        )}

                                        {/* ── CHANGE PASSWORD ── */}
                                        {activePanel === "password" && (
                                            <form onSubmit={savePassword} className="navbar__panel-form">
                                                {[
                                                    { field: "current", label: "Current Password", icon: "fa-lock" },
                                                    { field: "next", label: "New Password", icon: "fa-lock-open" },
                                                    { field: "confirm", label: "Confirm New", icon: "fa-lock" },
                                                ].map(({ field, label, icon }) => (
                                                    <div key={field} className="navbar__panel-group">
                                                        <label><i className={`fa-solid ${icon}`} /> {label}</label>
                                                        <input
                                                            type="password" placeholder="••••••••"
                                                            value={pwForm[field]}
                                                            onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                                                        />
                                                    </div>
                                                ))}
                                                {pwMsg && (
                                                    <p className={`navbar__panel-msg ${pwMsg.ok ? "navbar__panel-msg--ok" : "navbar__panel-msg--err"}`}>
                                                        <i className={`fa-solid ${pwMsg.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} />
                                                        {pwMsg.text}
                                                    </p>
                                                )}
                                                <button type="submit" className="navbar__panel-btn">
                                                    <i className="fa-solid fa-key" /> Change Password
                                                </button>
                                            </form>
                                        )}

                                    </div>
                                </div>
                            )}
                        </div>

                    ) : (
                        /* ── Logged OUT ── */
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
                        {NAV_LINKS.map((l) => (
                            <li key={l.id}>
                                <button
                                    className={`navbar__drawer-link ${activeLink === l.id ? "navbar__drawer-link--active" : ""}`}
                                    onClick={() => navClick(l.id)}
                                >
                                    <i className={l.icon} /> {l.label}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button className="navbar__drawer-link navbar__drawer-resume" onClick={downloadResume}>
                                <i className="fa-solid fa-download" /> Download Resume
                            </button>
                        </li>
                    </ul>
                </div>

                {menuOpen && <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />}
            </nav>

            {/* Auth Modal */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
