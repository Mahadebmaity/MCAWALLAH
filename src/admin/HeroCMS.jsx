import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function HeroCMS() {
    const { authFetch } = useAuth();
    const [hero, setHero] = useState(null);
    const [activeTab, setActiveTab] = useState('content'); // 'content' | 'styling' | 'visibility'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Form states for arrays
    const [newRole, setNewRole] = useState('');
    const [newTech, setNewTech] = useState('');

    const fetchHero = async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/hero`);
            if (res.ok) {
                const data = await res.json();
                setHero({
                    badgeText: 'Available for work',
                    showBadge: true,
                    greeting: "Hello, I'm",
                    showGreeting: true,
                    firstName: 'MCA',
                    lastName: 'WALLAH',
                    rolePrefix: '—',
                    typewriterRoles: ['Full Stack Developer', 'UI/UX Craftsman', 'Problem Solver'],
                    showTypewriter: true,
                    bio: '',
                    techPills: ['React', 'Node.js', 'TypeScript'],
                    showTechStack: true,
                    primaryCtaText: 'View My Work',
                    primaryCtaTarget: 'projects',
                    secondaryCtaText: "Let's Talk",
                    secondaryCtaTarget: 'contact',
                    showCtas: true,
                    stats: [],
                    showStats: true,
                    socialLinks: [],
                    showSocials: true,
                    showParticles: true,
                    layoutStyle: 'inline',
                    accentColor: '#e84545',
                    secondaryAccentColor: '#2e86de',
                    fontFamily: 'Syne',
                    buttonRadius: '10px',
                    defaultBackground: 'mesh',
                    isPublic: true,
                    ...data
                });
            }
        } catch (err) {
            console.error('Failed to load hero:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHero();
    }, []);

    const handleChange = (field, val) => {
        setHero(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await authFetch(`${API_BASE}/admin/section/hero`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hero)
            });
            if (res.ok) {
                // Broadcast live update to all tabs
                try {
                    const channel = new BroadcastChannel('portfolio_cms_sync');
                    channel.postMessage({ type: 'hero_updated', timestamp: Date.now() });
                    channel.close();
                } catch (e) {}

                setToast({
                    type: 'success',
                    title: 'Hero Section Saved! 🌟',
                    message: 'Your hero intro headline, layout style, and design colors are now live.'
                });
            } else {
                throw new Error('Save failed');
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

    const addRole = () => {
        if (!newRole.trim()) return;
        setHero(prev => ({
            ...prev,
            typewriterRoles: [...(prev.typewriterRoles || []), newRole.trim()]
        }));
        setNewRole('');
    };

    const removeRole = (index) => {
        setHero(prev => ({
            ...prev,
            typewriterRoles: prev.typewriterRoles.filter((_, i) => i !== index)
        }));
    };

    const addTech = () => {
        if (!newTech.trim()) return;
        setHero(prev => ({
            ...prev,
            techPills: [...(prev.techPills || []), newTech.trim()]
        }));
        setNewTech('');
    };

    const removeTech = (index) => {
        setHero(prev => ({
            ...prev,
            techPills: prev.techPills.filter((_, i) => i !== index)
        }));
    };

    const updateSocialLink = (index, field, value) => {
        setHero(prev => {
            const links = [...(prev.socialLinks || [])];
            links[index] = { ...links[index], [field]: value };
            return { ...prev, socialLinks: links };
        });
    };

    const addSocialLink = (preset = null) => {
        const newLink = preset || { label: 'New Link', href: 'https://', icon: 'fa-solid fa-link' };
        setHero(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), newLink]
        }));
    };

    const removeSocialLink = (index) => {
        setHero(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Hero CMS...</div>;
    if (!hero) return null;

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`adm-btn ${activeTab === 'content' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-pen-to-square" /> Content & Intro
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('styling')}
                    className={`adm-btn ${activeTab === 'styling' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-palette" /> Visual Styling & Layout
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('visibility')}
                    className={`adm-btn ${activeTab === 'visibility' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-eye" /> Element Visibility Controls
                </button>
            </div>

            <form onSubmit={handleSave}>
                {/* ── TAB 1: CONTENT & INTRO ── */}
                {activeTab === 'content' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-sparkles" style={{ color: 'var(--adm-primary)' }}></i>
                                    Hero Intro & Text Content
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Customize your name, greeting, bio story, and animated typewriter roles.
                                </p>
                            </div>
                        </div>

                        {/* Name & Greeting Grid */}
                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Greeting Text</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={hero.greeting || ''}
                                    onChange={(e) => handleChange('greeting', e.target.value)}
                                    placeholder="Hello, I'm"
                                />
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">First Name</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={hero.firstName || ''}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    placeholder="Mahadeb"
                                />
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">Last Name</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={hero.lastName || ''}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Maity"
                                />
                            </div>
                        </div>

                        {/* Badge Text */}
                        <div className="adm-form-group">
                            <label className="adm-label">Available Badge Text</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={hero.badgeText || ''}
                                onChange={(e) => handleChange('badgeText', e.target.value)}
                                placeholder="Available for work"
                            />
                        </div>

                        {/* Typewriter Section */}
                        <div className="adm-form-group" style={{ background: 'var(--adm-surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--adm-border)' }}>
                            <div className="adm-grid-2" style={{ marginBottom: '12px' }}>
                                <div>
                                    <label className="adm-label">Role Prefix / Separator</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.rolePrefix || ''}
                                        onChange={(e) => handleChange('rolePrefix', e.target.value)}
                                        placeholder="— or I build"
                                    />
                                </div>
                                <div>
                                    <label className="adm-label">Add Typewriter Role</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="adm-input"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            placeholder="e.g. Next.js Architect"
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
                                        />
                                        <button type="button" onClick={addRole} className="adm-btn adm-btn-secondary">
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <label className="adm-label" style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                                Active Animated Roles ({hero.typewriterRoles?.length || 0}):
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                {hero.typewriterRoles?.map((role, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            color: '#38bdf8',
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            fontSize: '12px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid rgba(56, 189, 248, 0.3)'
                                        }}
                                    >
                                        {role}
                                        <button
                                            type="button"
                                            onClick={() => removeRole(idx)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                        >
                                            <i className="fa-solid fa-xmark" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bio Story */}
                        <div className="adm-form-group">
                            <label className="adm-label">Hero Bio Story</label>
                            <textarea
                                rows={3}
                                className="adm-textarea"
                                value={hero.bio || ''}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="I craft elegant digital experiences that live at the intersection of design & code..."
                            />
                        </div>

                        {/* Tech Stack Pills */}
                        <div className="adm-form-group">
                            <label className="adm-label">Add Tech Stack Pills</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    placeholder="e.g. Docker, TypeScript"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                                />
                                <button type="button" onClick={addTech} className="adm-btn adm-btn-secondary">
                                    Add Tech
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {hero.techPills?.map((tech, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            background: 'var(--adm-surface-2)',
                                            color: 'var(--adm-text-main)',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid var(--adm-border)'
                                        }}
                                    >
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeTech(idx)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                        >
                                            <i className="fa-solid fa-xmark" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA Buttons Config */}
                        <div className="adm-grid-2">
                            <div className="adm-form-group">
                                <label className="adm-label">Primary Button Text & Target</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.primaryCtaText || ''}
                                        onChange={(e) => handleChange('primaryCtaText', e.target.value)}
                                        placeholder="View My Work"
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.primaryCtaTarget || ''}
                                        onChange={(e) => handleChange('primaryCtaTarget', e.target.value)}
                                        placeholder="projects"
                                    />
                                </div>
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">Secondary Button Text & Target</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.secondaryCtaText || ''}
                                        onChange={(e) => handleChange('secondaryCtaText', e.target.value)}
                                        placeholder="Let's Talk"
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.secondaryCtaTarget || ''}
                                        onChange={(e) => handleChange('secondaryCtaTarget', e.target.value)}
                                        placeholder="contact"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Social Media Channels & Profile Links Editor ── */}
                        <div style={{ marginTop: '28px', borderTop: '1px solid var(--adm-border)', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <label className="adm-label" style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                                        <i className="fa-solid fa-share-nodes" style={{ color: 'var(--adm-primary)' }} /> Social Profiles & Contact Channels
                                    </label>
                                    <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', display: 'block', marginTop: '2px' }}>
                                        Configure destination links (GitHub, LinkedIn, Twitter/X) or email address (e.g. `yourname@email.com` or `mailto:...`).
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => addSocialLink({ label: 'GitHub', href: 'https://github.com/username', icon: 'fa-brands fa-github' })}
                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa-brands fa-github" /> + GitHub
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSocialLink({ label: 'LinkedIn', href: 'https://linkedin.com/in/username', icon: 'fa-brands fa-linkedin' })}
                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa-brands fa-linkedin" /> + LinkedIn
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSocialLink({ label: 'Twitter', href: 'https://twitter.com/username', icon: 'fa-brands fa-x-twitter' })}
                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa-brands fa-x-twitter" /> + Twitter/X
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSocialLink({ label: 'Email', href: 'mailto:contact@domain.com', icon: 'fa-solid fa-envelope' })}
                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa-solid fa-envelope" /> + Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSocialLink()}
                                        className="adm-btn adm-btn-sm adm-btn-primary"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa-solid fa-plus" /> Custom
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(hero.socialLinks || []).map((link, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '130px 1fr 180px auto',
                                            gap: '10px',
                                            alignItems: 'center',
                                            background: 'var(--adm-surface-2)',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--adm-border)'
                                        }}
                                    >
                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block' }}>Label</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={link.label || ''}
                                                onChange={(e) => updateSocialLink(idx, 'label', e.target.value)}
                                                placeholder="GitHub, Email, etc."
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block' }}>Target URL or Email</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={link.href || ''}
                                                onChange={(e) => updateSocialLink(idx, 'href', e.target.value)}
                                                placeholder="https://... or mailto:you@domain.com"
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block' }}>FontAwesome Icon</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={link.icon || ''}
                                                onChange={(e) => updateSocialLink(idx, 'icon', e.target.value)}
                                                placeholder="fa-brands fa-github"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(idx)}
                                            className="adm-btn adm-btn-danger adm-btn-sm"
                                            style={{ marginTop: '16px', padding: '6px 10px' }}
                                            title="Delete link"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: VISUAL STYLING & LAYOUT ENGINE ── */}
                {activeTab === 'styling' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-palette" style={{ color: 'var(--adm-primary)' }}></i>
                                    Hero Styling & Visual Theme Engine
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Change the intro headline layout, color palette, typography font, and button radius.
                                </p>
                            </div>
                        </div>

                        {/* Layout Style Choice */}
                        <div className="adm-form-group">
                            <label className="adm-label" style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                                Hero Header UX Presentation Style
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                {/* Option 1: Glassmorphic Capsule */}
                                <div
                                    onClick={() => handleChange('layoutStyle', 'glassmorphism')}
                                    style={{
                                        border: `2px solid ${hero.layoutStyle === 'glassmorphism' ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                        background: hero.layoutStyle === 'glassmorphism' ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface-2)',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: hero.layoutStyle === 'glassmorphism' ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--adm-text-main)' }}>
                                            💎 Glassmorphic Floating Capsule
                                        </div>
                                        <span style={{ fontSize: '10px', background: '#38bdf822', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                            POPULAR
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        Frosted glass centerpiece with radiant gradient border, floating aura, and docked social &amp; stats bar.
                                    </div>
                                </div>

                                {/* Option 2: Developer Split + Code Window */}
                                <div
                                    onClick={() => handleChange('layoutStyle', 'split')}
                                    style={{
                                        border: `2px solid ${hero.layoutStyle === 'split' ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                        background: hero.layoutStyle === 'split' ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface-2)',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: hero.layoutStyle === 'split' ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                                        ⚡ Developer Split + Live Code IDE
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        2-Column showcase: Left intro &amp; buttons, Right interactive MacOS code IDE with copy button.
                                    </div>
                                </div>

                                {/* Option 3: Minimalist Editorial */}
                                <div
                                    onClick={() => handleChange('layoutStyle', 'editorial')}
                                    style={{
                                        border: `2px solid ${hero.layoutStyle === 'editorial' ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                        background: hero.layoutStyle === 'editorial' ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface-2)',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: hero.layoutStyle === 'editorial' ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                                        🌌 Minimalist Editorial Spotlight
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        Oversized bold typography, sleek spotlights, clean typography and minimal segmented cards.
                                    </div>
                                </div>

                                {/* Option 4: Retro-Futuristic Hologram */}
                                <div
                                    onClick={() => handleChange('layoutStyle', 'hologram')}
                                    style={{
                                        border: `2px solid ${hero.layoutStyle === 'hologram' ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                        background: hero.layoutStyle === 'hologram' ? 'rgba(56, 189, 248, 0.12)' : 'var(--adm-surface-2)',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: hero.layoutStyle === 'hologram' ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                                        🕹️ Retro-Futuristic Hologram Hub
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        Neon cybernetic glow halos, holographic badge accents, and futuristic terminal fonts.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Theme Accent Colors */}
                        <div className="adm-grid-2">
                            <div className="adm-form-group">
                                <label className="adm-label">Primary Accent Color</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={hero.accentColor || '#e84545'}
                                        onChange={(e) => handleChange('accentColor', e.target.value)}
                                        style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.accentColor || '#e84545'}
                                        onChange={(e) => handleChange('accentColor', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Secondary Gradient Color</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={hero.secondaryAccentColor || '#2e86de'}
                                        onChange={(e) => handleChange('secondaryAccentColor', e.target.value)}
                                        style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={hero.secondaryAccentColor || '#2e86de'}
                                        onChange={(e) => handleChange('secondaryAccentColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Typography & Background Presets */}
                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Headline Font Family</label>
                                <select
                                    className="adm-select"
                                    value={hero.fontFamily || 'Comic Neue'}
                                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                                >
                                    <option value="Comic Neue">Comic Sans MS / Comic Neue</option>
                                    <option value="Syne">Syne (Bold Display)</option>
                                    <option value="Outfit">Outfit (High-End Modern)</option>
                                    <option value="Fira Code">Fira Code (Developer Mono)</option>
                                    <option value="Inter">Inter (Clean Editorial)</option>
                                    <option value="DM Sans">DM Sans (Minimal Geometric)</option>
                                </select>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Button Corner Radius</label>
                                <select
                                    className="adm-select"
                                    value={hero.buttonRadius || '10px'}
                                    onChange={(e) => handleChange('buttonRadius', e.target.value)}
                                >
                                    <option value="0px">Sharp (0px)</option>
                                    <option value="8px">Standard (8px)</option>
                                    <option value="12px">Rounded (12px)</option>
                                    <option value="999px">Full Pill (999px)</option>
                                </select>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Default Background Preset</label>
                                <select
                                    className="adm-select"
                                    value={hero.defaultBackground || 'mesh'}
                                    onChange={(e) => handleChange('defaultBackground', e.target.value)}
                                >
                                    <option value="mesh">Mesh Gradient</option>
                                    <option value="aurora">Aurora Glow</option>
                                    <option value="grid">Cyber Grid</option>
                                    <option value="dots">Dot Matrix</option>
                                    <option value="noise">Textured Noise</option>
                                    <option value="minimal">Minimal Clean</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: ELEMENT VISIBILITY CONTROLS ── */}
                {activeTab === 'visibility' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-sliders" style={{ color: 'var(--adm-primary)' }}></i>
                                    Element Visibility Master Controls
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Toggle which components and decorative elements are visible to visitors.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            {[
                                { key: 'showBadge', title: 'Available Badge', desc: 'Top status pill (e.g. "Available for work")' },
                                { key: 'showGreeting', title: 'Greeting Text', desc: 'Greeting phrase (e.g. "Hello, I\'m")' },
                                { key: 'showTypewriter', title: 'Animated Typewriter', desc: 'Rotating role titles with blinking cursor' },
                                { key: 'showTechStack', title: 'Tech Stack Pills', desc: 'Skills tags row (React, Node, etc.)' },
                                { key: 'showCtas', title: 'Action Buttons (CTAs)', desc: 'View My Work & Let\'s Talk buttons' },
                                { key: 'showSocials', title: 'Social Media Icons', desc: 'GitHub, LinkedIn, Twitter quick links' },
                                { key: 'showStats', title: 'Quick Stats Strip', desc: 'Years exp, projects completed counters' },
                                { key: 'showParticles', title: 'Floating Particles', desc: 'Animated background ambient sparks' }
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                            {item.desc}
                                        </p>
                                    </div>

                                    <label className="adm-switch">
                                        <input
                                            type="checkbox"
                                            checked={hero[item.key] !== false}
                                            onChange={(e) => handleChange(item.key, e.target.checked)}
                                        />
                                        <span className="adm-slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Bar */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="adm-btn adm-btn-primary"
                        style={{ padding: '12px 32px', fontSize: '14px', fontWeight: '700' }}
                    >
                        <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving Changes...' : 'Save & Publish Hero'}
                    </button>
                </div>
            </form>
        </div>
    );
}
