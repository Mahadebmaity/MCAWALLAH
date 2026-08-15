// src/admin/NavbarCMS.jsx
import { useState, useEffect } from 'react';
import ToastNotification from './ToastNotification';
import './admin.css';

const DEFAULT_NAV_LINKS = [
    { id: 'home', label: 'Home', icon: 'fa-solid fa-house', isVisible: true },
    { id: 'about', label: 'About', icon: 'fa-solid fa-circle-user', isVisible: true },
    { id: 'projects', label: 'Projects', icon: 'fa-solid fa-folder-open', isVisible: true },
    { id: 'fun-game', label: 'Fun Game', icon: 'fa-solid fa-gamepad', isVisible: true },
    { id: 'contact', label: 'Get in Touch', icon: 'fa-solid fa-handshake', isVisible: true }
];

export default function NavbarCMS() {
    const [navbar, setNavbar] = useState({
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
        navLinks: DEFAULT_NAV_LINKS,
        blurStrength: '24px',
        borderRadius: '999px',
        accentColor: '#e84545',
        isPublic: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('styles'); // 'styles' | 'logo' | 'links' | 'actions'
    const [newLink, setNewLink] = useState({ id: '', label: '', icon: 'fa-solid fa-link' });

    // Fetch Navbar Data
    useEffect(() => {
        const fetchNavbar = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch('http://localhost:5000/api/admin/section/navbar', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data._id) {
                        setNavbar({
                            ...data,
                            navLinks: data.navLinks?.length ? data.navLinks : DEFAULT_NAV_LINKS
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNavbar();
    }, []);

    const handleChange = (field, value) => {
        setNavbar(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/admin/section/navbar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(navbar)
            });

            if (res.ok) {
                const updated = await res.json();
                setNavbar(updated);

                // Broadcast live sync
                try {
                    localStorage.setItem('portfolio_data_updated', Date.now().toString());
                    const channel = new BroadcastChannel('portfolio_cms_sync');
                    channel.postMessage({ type: 'NAVBAR_UPDATED', data: updated });
                    channel.close();
                } catch {}

                setToast({
                    type: 'success',
                    title: 'Navbar Saved! 🧭',
                    message: 'Your navigation bar styling & controls are now live.'
                });
            } else {
                throw new Error('Failed to save navbar settings');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    // Nav Links Management
    const toggleLinkVisibility = (index) => {
        const updated = [...navbar.navLinks];
        updated[index].isVisible = !updated[index].isVisible;
        setNavbar(prev => ({ ...prev, navLinks: updated }));
    };

    const updateLinkLabel = (index, val) => {
        const updated = [...navbar.navLinks];
        updated[index].label = val;
        setNavbar(prev => ({ ...prev, navLinks: updated }));
    };

    const removeLink = (index) => {
        setNavbar(prev => ({
            ...prev,
            navLinks: prev.navLinks.filter((_, i) => i !== index)
        }));
    };

    const addCustomLink = () => {
        if (!newLink.label.trim()) return;
        const slug = newLink.id.trim() || newLink.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const item = {
            id: slug,
            label: newLink.label.trim(),
            icon: newLink.icon || 'fa-solid fa-link',
            isVisible: true
        };
        setNavbar(prev => ({
            ...prev,
            navLinks: [...prev.navLinks, item]
        }));
        setNewLink({ id: '', label: '', icon: 'fa-solid fa-link' });
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Navbar Studio...</div>;
    }

    return (
        <div>
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* Top Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--adm-text-main)' }}>
                        🧭 Navigation Bar Studio
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                        Customize layout presentation, floating island styles, logo branding, live status pills, and menu buttons.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="adm-btn adm-btn-primary"
                >
                    <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                    {saving ? 'Saving...' : 'Save Navbar Settings'}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--adm-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                {[
                    { id: 'styles', label: '🎨 Presentation Style & Dock', icon: 'fa-solid fa-palette' },
                    { id: 'logo', label: '✨ Logo & Status Badge', icon: 'fa-solid fa-signature' },
                    { id: 'links', label: '🔗 Nav Menu Links', icon: 'fa-solid fa-list' },
                    { id: 'actions', label: '⚡ Action Buttons & CTAs', icon: 'fa-solid fa-toggle-on' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`adm-btn ${activeTab === tab.id ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                    >
                        <i className={tab.icon} /> {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave}>
                {/* ── TAB 1: PRESENTATION STYLE & DOCK ── */}
                {activeTab === 'styles' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-palette" style={{ color: 'var(--adm-primary)' }} />
                                    Navbar Layout &amp; Presentation Style
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Choose how the top navigation header presents itself across desktop and mobile devices.
                                </p>
                            </div>
                        </div>

                        {/* 4 Modern Presentation Style Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                            {[
                                {
                                    id: 'floating-dock',
                                    title: '💎 Floating Frosted Glass Dock',
                                    badge: 'POPULAR',
                                    desc: 'macOS-inspired floating island with radiant blur, subtle borders, and smooth hovering shadow.'
                                },
                                {
                                    id: 'cyber-capsule',
                                    title: '⚡ Cyber Neon Capsule',
                                    badge: 'NEO-DEV',
                                    desc: 'Glowing neon outline borders, futuristic active highlighter, and cyber status accents.'
                                },
                                {
                                    id: 'minimal-island',
                                    title: '🌌 Minimalist Island Pill',
                                    badge: 'MINIMAL',
                                    desc: 'Ultra-clean rounded pill dock with streamlined buttons and high-contrast typography.'
                                },
                                {
                                    id: 'full-width',
                                    title: '📜 Classic Edge-to-Edge Bar',
                                    badge: 'CLASSIC',
                                    desc: 'Traditional full-width fixed navbar with bottom frosted blur and sticky shadow on scroll.'
                                }
                            ].map(st => (
                                <div
                                    key={st.id}
                                    onClick={() => handleChange('layoutStyle', st.id)}
                                    style={{
                                        border: `2px solid ${navbar.layoutStyle === st.id ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                        background: navbar.layoutStyle === st.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface-2)',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: navbar.layoutStyle === st.id ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <strong style={{ fontSize: '14px', color: 'var(--adm-text-main)' }}>{st.title}</strong>
                                        <span style={{ fontSize: '10px', background: '#38bdf822', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                            {st.badge}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        {st.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Shape & Blur Controls */}
                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Border Radius</label>
                                <select
                                    className="adm-input"
                                    value={navbar.borderRadius || '999px'}
                                    onChange={(e) => handleChange('borderRadius', e.target.value)}
                                >
                                    <option value="999px">Full Pill (999px)</option>
                                    <option value="20px">Rounded Island (20px)</option>
                                    <option value="12px">Subtle Rounded (12px)</option>
                                    <option value="0px">Sharp Flat (0px)</option>
                                </select>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Glass Blur Intensity</label>
                                <select
                                    className="adm-input"
                                    value={navbar.blurStrength || '24px'}
                                    onChange={(e) => handleChange('blurStrength', e.target.value)}
                                >
                                    <option value="36px">Deep Blur (36px)</option>
                                    <option value="24px">Standard Frosted (24px)</option>
                                    <option value="12px">Light Blur (12px)</option>
                                    <option value="0px">Solid Background</option>
                                </select>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Navbar Accent Color</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={navbar.accentColor || '#e84545'}
                                        onChange={(e) => handleChange('accentColor', e.target.value)}
                                        style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={navbar.accentColor || '#e84545'}
                                        onChange={(e) => handleChange('accentColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: LOGO & STATUS BADGE ── */}
                {activeTab === 'logo' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-signature" style={{ color: 'var(--adm-primary)' }} />
                                    Logo Branding &amp; Live Availability Badge
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Customize your brand symbol, developer prefix/suffix, and top-bar status pill.
                                </p>
                            </div>
                        </div>

                        {/* Logo Customizer */}
                        <div className="adm-grid-3" style={{ marginBottom: '20px' }}>
                            <div className="adm-form-group">
                                <label className="adm-label">Logo Prefix</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={navbar.logoPrefix || ''}
                                    onChange={(e) => handleChange('logoPrefix', e.target.value)}
                                    placeholder="< or ~ or //"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Brand Name / Logo Text</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={navbar.logoText || ''}
                                    onChange={(e) => handleChange('logoText', e.target.value)}
                                    placeholder="Mahadeb"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Logo Suffix</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={navbar.logoSuffix || ''}
                                    onChange={(e) => handleChange('logoSuffix', e.target.value)}
                                    placeholder="/> or .dev"
                                />
                            </div>
                        </div>

                        <div className="adm-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={navbar.showLogoPulse !== false}
                                    onChange={(e) => handleChange('showLogoPulse', e.target.checked)}
                                />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                                    Enable Animated Pulsing Dot next to logo
                                </span>
                            </label>
                        </div>

                        <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '20px', marginTop: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                🟢 Navbar Live Status Pill (Optional)
                            </h4>

                            <div className="adm-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={navbar.showStatusBadge || false}
                                        onChange={(e) => handleChange('showStatusBadge', e.target.checked)}
                                    />
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                                        Show live availability status pill in the navbar
                                    </span>
                                </label>
                            </div>

                            {navbar.showStatusBadge && (
                                <div className="adm-form-group">
                                    <label className="adm-label">Status Badge Text</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={navbar.statusBadgeText || ''}
                                        onChange={(e) => handleChange('statusBadgeText', e.target.value)}
                                        placeholder="Available for work / Open for hire"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 3: NAV MENU LINKS ── */}
                {activeTab === 'links' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-list" style={{ color: 'var(--adm-primary)' }} />
                                    Navigation Menu Links Manager
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Show, hide, or rename navigation links. When clicked, they smoothly scroll to that section.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                            {navbar.navLinks.map((link, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        padding: '12px 18px',
                                        borderRadius: '10px',
                                        gap: '12px',
                                        opacity: link.isVisible ? 1 : 0.6
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <i className={link.icon} style={{ color: 'var(--adm-primary)', fontSize: '16px' }} />
                                        <input
                                            type="text"
                                            className="adm-input"
                                            style={{ maxWidth: '240px', padding: '6px 12px' }}
                                            value={link.label}
                                            onChange={(e) => updateLinkLabel(idx, e.target.value)}
                                        />
                                        <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'monospace' }}>
                                            #{link.id}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => toggleLinkVisibility(idx)}
                                            className={`adm-btn adm-btn-sm ${link.isVisible ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                                        >
                                            <i className={`fa-solid ${link.isVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                                            {link.isVisible ? 'Visible' : 'Hidden'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeLink(idx)}
                                            className="adm-btn adm-btn-sm adm-btn-danger"
                                            title="Delete link"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Custom Link */}
                        <div style={{ background: 'var(--adm-surface)', border: '1px dashed var(--adm-border)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '700' }}>+ Add Custom Nav Link</h4>
                            <div className="adm-grid-3">
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="Label (e.g. Services / Blog)"
                                    value={newLink.label}
                                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="Section ID / Anchor (e.g. services)"
                                    value={newLink.id}
                                    onChange={(e) => setNewLink({ ...newLink, id: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomLink}
                                    disabled={!newLink.label.trim()}
                                    className="adm-btn adm-btn-primary"
                                >
                                    <i className="fa-solid fa-plus" /> Add to Menu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 4: ACTION BUTTONS & CTAS ── */}
                {activeTab === 'actions' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-toggle-on" style={{ color: 'var(--adm-primary)' }} />
                                    Navbar Action Buttons &amp; Interactive Controls
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Configure the quick actions displayed on the right side of the navbar.
                                </p>
                            </div>
                        </div>

                        {/* Theme Switcher Toggle */}
                        <div style={{ background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)', padding: '16px', borderRadius: '12px', marginBottom: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={navbar.showThemeToggle !== false}
                                    onChange={(e) => handleChange('showThemeToggle', e.target.checked)}
                                />
                                <div>
                                    <strong style={{ fontSize: '14px', color: 'var(--adm-text-main)' }}>🌙 Dark / Light Mode Switcher</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                        Allows visitors to toggle between Dark mode and Light mode on the fly.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Resume Download Button Toggle */}
                        <div style={{ background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)', padding: '16px', borderRadius: '12px', marginBottom: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: navbar.showResumeButton ? '12px' : 0 }}>
                                <input
                                    type="checkbox"
                                    checked={navbar.showResumeButton !== false}
                                    onChange={(e) => handleChange('showResumeButton', e.target.checked)}
                                />
                                <div>
                                    <strong style={{ fontSize: '14px', color: 'var(--adm-text-main)' }}>📄 Resume Download / Multi-Version Dropdown</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                        Displays the quick resume download button or dropdown selector.
                                    </p>
                                </div>
                            </label>

                            {navbar.showResumeButton !== false && (
                                <div className="adm-form-group" style={{ margin: 0, paddingLeft: '24px' }}>
                                    <label className="adm-label">Button Label Override</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={navbar.resumeButtonText || 'Resume'}
                                        onChange={(e) => handleChange('resumeButtonText', e.target.value)}
                                        placeholder="Resume / Download CV"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Hire Me / Let's Talk CTA Toggle */}
                        <div style={{ background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)', padding: '18px', borderRadius: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: navbar.showHireMeButton ? '16px' : 0 }}>
                                <input
                                    type="checkbox"
                                    checked={navbar.showHireMeButton || false}
                                    onChange={(e) => handleChange('showHireMeButton', e.target.checked)}
                                />
                                <div>
                                    <strong style={{ fontSize: '14px', color: 'var(--adm-text-main)' }}>🚀 "Let's Talk" / "Hire Me" Direct CTA Button</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                        Prominent high-conversion pill button that scrolls straight to your contact section or booking form.
                                    </p>
                                </div>
                            </label>

                            {navbar.showHireMeButton && (
                                <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '16px', marginTop: '12px' }}>
                                    
                                    {/* Style Preset Selector */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="adm-label" style={{ marginBottom: '8px' }}>Button Presentation Style</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                            {[
                                                { id: 'gradient-glow', title: '💎 Vibrant Gradient Glow', desc: 'Glowing multi-stop radiant gradient with neon hover aura.' },
                                                { id: 'cyber-outline', title: '⚡ Cyber Neon Outline', desc: 'Cyberpunk glowing outline with energetic neon fill.' },
                                                { id: 'glassmorphic-pill', title: '🪐 Frosted Glass Pill', desc: 'Subtle frosted capsule with border glow on hover.' },
                                                { id: 'accent-solid', title: '🔥 Solid Brand Accent', desc: 'Punchy solid brand accent with smooth hover elevation.' }
                                            ].map(st => (
                                                <div
                                                    key={st.id}
                                                    onClick={() => handleChange('hireMeStyle', st.id)}
                                                    style={{
                                                        border: `2px solid ${(navbar.hireMeStyle || 'gradient-glow') === st.id ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                                        background: (navbar.hireMeStyle || 'gradient-glow') === st.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface)',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <strong style={{ fontSize: '13px', color: 'var(--adm-text-main)', display: 'block', marginBottom: '4px' }}>
                                                        {st.title}
                                                    </strong>
                                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--adm-text-muted)', lineHeight: '1.3' }}>
                                                        {st.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="adm-grid-3">
                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label className="adm-label">Button Text</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                value={navbar.hireMeButtonText || "Let's Talk"}
                                                onChange={(e) => handleChange('hireMeButtonText', e.target.value)}
                                                placeholder="Let's Talk / Hire Me / Get in Touch"
                                            />
                                        </div>

                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label className="adm-label">Button Icon</label>
                                            <select
                                                className="adm-input"
                                                value={navbar.hireMeIcon || 'fa-solid fa-paper-plane'}
                                                onChange={(e) => handleChange('hireMeIcon', e.target.value)}
                                            >
                                                <option value="fa-solid fa-paper-plane">Paper Plane ✈</option>
                                                <option value="fa-solid fa-bolt">Electric Bolt ⚡</option>
                                                <option value="fa-solid fa-calendar-check">Calendar 📅</option>
                                                <option value="fa-solid fa-handshake">Handshake 🤝</option>
                                                <option value="fa-solid fa-comments">Chat Bubble 💬</option>
                                                <option value="fa-solid fa-arrow-right">Arrow Right ➔</option>
                                                <option value="none">No Icon</option>
                                            </select>
                                        </div>

                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label className="adm-label">Scroll Target Anchor</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                value={navbar.hireMeTarget || 'contact'}
                                                onChange={(e) => handleChange('hireMeTarget', e.target.value)}
                                                placeholder="contact"
                                            />
                                        </div>
                                    </div>

                                    {/* Live Button Preview Box */}
                                    <div style={{ marginTop: '16px', padding: '14px 18px', background: 'var(--adm-surface)', border: '1px dashed var(--adm-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <strong style={{ fontSize: '12px', color: 'var(--adm-text-main)' }}>Live Button Preview:</strong>
                                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--adm-text-muted)' }}>Interactive preview with chosen style &amp; icon.</p>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                className={`navbar__cta-btn navbar__cta-btn--${navbar.hireMeStyle || 'gradient-glow'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {}}
                                            >
                                                <span>{navbar.hireMeButtonText || "Let's Talk"}</span>
                                                {navbar.hireMeIcon && navbar.hireMeIcon !== 'none' && (
                                                    <i className={navbar.hireMeIcon} style={{ fontSize: '11px' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="adm-btn adm-btn-primary"
                        style={{ padding: '12px 28px', fontSize: '15px' }}
                    >
                        <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                        {saving ? 'Saving Changes...' : 'Save Navbar Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
