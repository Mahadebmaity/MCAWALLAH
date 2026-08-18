import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

const DEFAULT_SOCIAL_PRESETS = [
    { platform: 'github', label: 'GitHub', href: 'https://github.com/username', icon: 'fa-brands fa-github', color: '#f0f0f0' },
    { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/username', icon: 'fa-brands fa-linkedin', color: '#0A66C2' },
    { platform: 'twitter', label: 'Twitter', href: 'https://x.com/username', icon: 'fa-brands fa-x-twitter', color: '#1DA1F2' },
    { platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/username', icon: 'fa-brands fa-instagram', color: '#E1306C' },
    { platform: 'youtube', label: 'YouTube', href: 'https://youtube.com/@channel', icon: 'fa-brands fa-youtube', color: '#FF0000' },
    { platform: 'discord', label: 'Discord', href: 'https://discord.gg/invite', icon: 'fa-brands fa-discord', color: '#5865F2' },
    { platform: 'telegram', label: 'Telegram', href: 'https://t.me/username', icon: 'fa-brands fa-telegram', color: '#229ED9' }
];

export default function ContactCMS() {
    const { authFetch } = useAuth();
    const [settings, setSettings] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'socials' | 'visibility'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchSettings = async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/settings`);
            if (res.ok) {
                const data = await res.json();
                const initialSocials = (data.socialLinks && data.socialLinks.length > 0)
                    ? data.socialLinks.map(s => ({
                        platform: s.platform || 'link',
                        label: s.label || 'Link',
                        href: s.href || s.url || 'https://',
                        icon: s.icon || 'fa-solid fa-link',
                        color: s.color || '#38bdf8'
                    }))
                    : DEFAULT_SOCIAL_PRESETS.slice(0, 4);

                setSettings({
                    contactHeading: 'Let\'s',
                    contactHeadingAccent: 'Connect',
                    contactSubtitle: 'Have a project in mind, want to collaborate, or just say hi? My inbox is always open — I\'ll get back within 24 hours.',
                    contactEmail: 'mahadeb@portfolio.com',
                    contactPhone: '+91 12345 67890',
                    contactLocation: 'Haldia, West Bengal, India',
                    availabilityText: 'Currently available for freelance & full-time roles',
                    availabilityStatus: 'available',
                    showEmailCard: true,
                    showPhoneCard: true,
                    showLocationCard: true,
                    showAvailability: true,
                    showSocialsRow: true,
                    ...data,
                    socialLinks: initialSocials
                });
            }
        } catch (err) {
            console.error('Failed to load contact settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (field, val) => {
        setSettings(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setSavedSuccess(false);

        try {
            // Normalize social links to contain both url and href for complete backward compatibility
            const normalizedSocials = (settings.socialLinks || []).map(s => ({
                ...s,
                url: s.href || s.url,
                href: s.href || s.url
            }));

            const payload = {
                ...settings,
                socialLinks: normalizedSocials
            };

            const res = await authFetch(`${API_BASE}/admin/section/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSavedSuccess(true);

                // Broadcast live update to all open client tabs
                try {
                    const channel = new BroadcastChannel('portfolio_cms_sync');
                    channel.postMessage({ type: 'settings_updated', timestamp: Date.now() });
                    channel.close();
                } catch (e) {}
                localStorage.setItem('portfolio_data_updated', Date.now().toString());

                setToast({
                    type: 'success',
                    title: 'Contact Section Saved! 📬',
                    message: 'Your contact details, socials, and inquiry configuration are now live on your portfolio.'
                });

                setTimeout(() => setSavedSuccess(false), 3500);
            } else {
                throw new Error('Failed to save contact settings');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Could not update contact section.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Social Links Handlers
    const addSocialLink = (preset = null) => {
        const item = preset || { platform: 'custom', label: 'New Link', href: 'https://', icon: 'fa-solid fa-link', color: '#38bdf8' };
        setSettings(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), item]
        }));
    };

    const updateSocialLink = (index, field, value) => {
        setSettings(prev => {
            const list = [...(prev.socialLinks || [])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, socialLinks: list };
        });
    };

    const removeSocialLink = (index) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index)
        }));
    };

    const resetSocialsToDefault = () => {
        setSettings(prev => ({
            ...prev,
            socialLinks: DEFAULT_SOCIAL_PRESETS.slice(0, 4)
        }));
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Contact Section CMS...</div>;
    if (!settings) return null;

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`adm-btn ${activeTab === 'details' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-address-card" /> Contact Info & Pitch
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('socials')}
                    className={`adm-btn ${activeTab === 'socials' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-share-nodes" /> "Find Me On" Socials ({settings.socialLinks?.length || 0})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('visibility')}
                    className={`adm-btn ${activeTab === 'visibility' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-sliders" /> Display & Visibility
                </button>
            </div>

            <form onSubmit={handleSave}>
                {/* ── TAB 1: CONTACT INFO & HEADLINE ── */}
                {activeTab === 'details' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-paper-plane" style={{ color: 'var(--adm-primary)' }} />
                                    Contact Section Header & Direct Channels
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Customize the headline, invitation pitch, email address, phone number, and location card.
                                </p>
                            </div>
                        </div>

                        {/* Title & Accent Grid */}
                        <div className="adm-grid-2">
                            <div className="adm-form-group">
                                <label className="adm-label">Header Prefix (e.g. "Let's")</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={settings.contactHeading || ''}
                                    onChange={(e) => handleChange('contactHeading', e.target.value)}
                                    placeholder="Let's"
                                />
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">Header Accent Word (e.g. "Connect" or "Talk")</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={settings.contactHeadingAccent || ''}
                                    onChange={(e) => handleChange('contactHeadingAccent', e.target.value)}
                                    placeholder="Connect"
                                    style={{ color: '#e84545', fontWeight: '700' }}
                                />
                            </div>
                        </div>

                        {/* Subtitle / Pitch Story */}
                        <div className="adm-form-group">
                            <label className="adm-label">Contact Invitation Pitch / Subtitle</label>
                            <textarea
                                rows={3}
                                className="adm-textarea"
                                value={settings.contactSubtitle || ''}
                                onChange={(e) => handleChange('contactSubtitle', e.target.value)}
                                placeholder="Have a project in mind, want to collaborate, or just say hi? My inbox is always open — I'll get back within 24 hours."
                            />
                        </div>

                        {/* Direct Channels Grid */}
                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--adm-border)', paddingTop: '18px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-address-book" style={{ color: 'var(--adm-primary)' }} />
                                Direct Info Cards
                            </h4>

                            <div className="adm-grid-3">
                                <div className="adm-form-group">
                                    <label className="adm-label">
                                        <i className="fa-solid fa-envelope" style={{ color: '#38bdf8', marginRight: '6px' }} />
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        className="adm-input"
                                        value={settings.contactEmail || ''}
                                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                                        placeholder="mahadeb@portfolio.com"
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">
                                        <i className="fa-solid fa-phone" style={{ color: '#10b981', marginRight: '6px' }} />
                                        Contact Phone / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={settings.contactPhone || ''}
                                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                                        placeholder="+91 12345 67890"
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">
                                        <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', marginRight: '6px' }} />
                                        Location / City
                                    </label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={settings.contactLocation || ''}
                                        onChange={(e) => handleChange('contactLocation', e.target.value)}
                                        placeholder="Haldia, West Bengal, India"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Availability Pill Config */}
                        <div style={{ marginTop: '16px', background: 'var(--adm-surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--adm-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="adm-label" style={{ margin: 0, fontWeight: '700' }}>
                                    <i className="fa-solid fa-circle-dot" style={{ color: '#10b981', marginRight: '6px' }} />
                                    Live Availability Status Pill
                                </label>
                            </div>
                            <div className="adm-grid-2">
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '4px' }}>Status Text</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={settings.availabilityText || ''}
                                        onChange={(e) => handleChange('availabilityText', e.target.value)}
                                        placeholder="Currently available for freelance & full-time roles"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '4px' }}>Status Mood / Level</label>
                                    <select
                                        className="adm-select"
                                        value={settings.availabilityStatus || 'available'}
                                        onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                                    >
                                        <option value="available">🟢 Available for Work / Freelance</option>
                                        <option value="limited">🟡 Limited Availability / Part-Time</option>
                                        <option value="busy">🔴 Busy on Active Project</option>
                                        <option value="hiring">✨ Open to Mentorship & Collab</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: "FIND ME ON" SOCIAL CHANNELS ── */}
                {activeTab === 'socials' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-share-nodes" style={{ color: 'var(--adm-primary)' }} />
                                    "Find Me On" Social Media Buttons
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Configure external profile links (GitHub, LinkedIn, Twitter/X, Instagram, Discord, etc.) with custom icons & brand colors.
                                </p>
                            </div>

                            {/* 1-Click Quick Add Presets */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => addSocialLink(DEFAULT_SOCIAL_PRESETS[0])}
                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                    style={{ fontSize: '11px' }}
                                >
                                    <i className="fa-brands fa-github" /> + GitHub
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addSocialLink(DEFAULT_SOCIAL_PRESETS[1])}
                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                    style={{ fontSize: '11px' }}
                                >
                                    <i className="fa-brands fa-linkedin" /> + LinkedIn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addSocialLink(DEFAULT_SOCIAL_PRESETS[2])}
                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                    style={{ fontSize: '11px' }}
                                >
                                    <i className="fa-brands fa-x-twitter" /> + Twitter/X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addSocialLink(DEFAULT_SOCIAL_PRESETS[3])}
                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                    style={{ fontSize: '11px' }}
                                >
                                    <i className="fa-brands fa-instagram" /> + Instagram
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addSocialLink()}
                                    className="adm-btn adm-btn-sm adm-btn-primary"
                                    style={{ fontSize: '11px' }}
                                >
                                    <i className="fa-solid fa-plus" /> Custom Channel
                                </button>
                                <button
                                    type="button"
                                    onClick={resetSocialsToDefault}
                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                    style={{ fontSize: '11px', color: '#f59e0b' }}
                                    title="Reset to 4 default social links"
                                >
                                    <i className="fa-solid fa-rotate-left" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Social Links List */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                            {settings.socialLinks?.map((s, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: s.color || 'var(--adm-primary)',
                                                fontSize: '14px'
                                            }}>
                                                <i className={s.icon || 'fa-solid fa-link'} />
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                                {s.label || `Social Link #${idx + 1}`}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(idx)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                                            title="Delete social channel"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>

                                    <div className="adm-grid-2">
                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '2px' }}>Button Label</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={s.label || ''}
                                                onChange={(e) => updateSocialLink(idx, 'label', e.target.value)}
                                                placeholder="GitHub, LinkedIn, etc."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '2px' }}>FontAwesome Icon</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={s.icon || ''}
                                                onChange={(e) => updateSocialLink(idx, 'icon', e.target.value)}
                                                placeholder="fa-brands fa-github"
                                            />
                                        </div>
                                    </div>

                                    <div className="adm-grid-2">
                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '2px' }}>Destination URL</label>
                                            <input
                                                type="text"
                                                className="adm-input"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                value={s.href || s.url || ''}
                                                onChange={(e) => updateSocialLink(idx, 'href', e.target.value)}
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '10px', color: 'var(--adm-text-muted)', display: 'block', marginBottom: '2px' }}>Hover Glow Color</label>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <input
                                                    type="color"
                                                    value={s.color || '#38bdf8'}
                                                    onChange={(e) => updateSocialLink(idx, 'color', e.target.value)}
                                                    style={{ width: '32px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                                                />
                                                <input
                                                    type="text"
                                                    className="adm-input"
                                                    style={{ padding: '6px 8px', fontSize: '11px', flex: 1 }}
                                                    value={s.color || '#38bdf8'}
                                                    onChange={(e) => updateSocialLink(idx, 'color', e.target.value)}
                                                    placeholder="#38bdf8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── TAB 3: VISIBILITY CONTROLS ── */}
                {activeTab === 'visibility' && (
                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-sliders" style={{ color: 'var(--adm-primary)' }} />
                                    Contact Element Display &amp; Visibility Controls
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                    Toggle which cards, badges, and social media rows are displayed to visitors on the contact section.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            {[
                                { key: 'showEmailCard', title: 'Email Card', desc: 'Display email address card with mailto link' },
                                { key: 'showPhoneCard', title: 'Phone / WhatsApp Card', desc: 'Display phone number card with tel link' },
                                { key: 'showLocationCard', title: 'Location Card', desc: 'Display city & region card' },
                                { key: 'showAvailability', title: 'Availability Status Pill', desc: 'Display green status dot with current work status' },
                                { key: 'showSocialsRow', title: '"Find Me On" Social Buttons', desc: 'Display GitHub, LinkedIn, Twitter and custom social links' }
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
                                            checked={settings[item.key] !== false}
                                            onChange={(e) => handleChange(item.key, e.target.checked)}
                                        />
                                        <span className="adm-slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Save Action Footer ── */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`adm-btn adm-btn-primary ${saving ? 'adm-btn-loading' : ''}`}
                        style={{
                            minWidth: '180px',
                            padding: '12px 28px',
                            fontSize: '14px',
                            background: savedSuccess ? '#059669' : undefined,
                            borderColor: savedSuccess ? '#34d399' : undefined
                        }}
                    >
                        {saving ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin" /> Saving...
                            </>
                        ) : savedSuccess ? (
                            <>
                                <i className="fa-solid fa-check" /> Saved Successfully! ✓
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-floppy-disk" /> Save Contact Section
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
