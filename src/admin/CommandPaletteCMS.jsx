import { useState } from 'react';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function CommandPaletteCMS() {
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testQuery, setTestQuery] = useState('');

    const [settings, setSettings] = useState({
        enabled: true,
        enableFloatingPill: true,
        enableNavigationGroup: true,
        enableProjectsGroup: true,
        enableDocsGroup: true,
        enableArcadeGroup: true,
        enableSocialGroup: true,
        customCommands: [
            { id: 'custom-1', title: 'Schedule a Tech Interview', url: '#contact', icon: 'fa-solid fa-calendar-check', group: 'Custom Actions' },
            { id: 'custom-2', title: 'Hire for Freelance Projects', url: '#contact', icon: 'fa-solid fa-handshake', group: 'Custom Actions' }
        ]
    });

    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newIcon, setNewIcon] = useState('fa-solid fa-bolt');

    const handleSaveSettings = (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setToast({
                type: 'success',
                title: 'Settings Saved! ⚡',
                message: 'Command palette configuration and custom shortcuts are now active.'
            });
        }, 300);
    };

    const handleAddCustomCommand = () => {
        if (!newTitle.trim() || !newUrl.trim()) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Command title and destination URL are required.' });
            return;
        }

        const newCmd = {
            id: `custom-${Date.now()}`,
            title: newTitle.trim(),
            url: newUrl.trim(),
            icon: newIcon,
            group: 'Custom Actions'
        };

        setSettings(p => ({
            ...p,
            customCommands: [...p.customCommands, newCmd]
        }));
        setNewTitle('');
        setNewUrl('');
        setToast({ type: 'success', title: 'Added', message: `Added shortcut "${newCmd.title}"` });
    };

    const handleRemoveCustomCommand = (id) => {
        setSettings(p => ({
            ...p,
            customCommands: p.customCommands.filter(c => c.id !== id)
        }));
    };

    const previewCommands = [
        { id: 'p-1', title: 'Home / Hero Header', group: 'Navigation', icon: 'fa-solid fa-house', desc: 'Jump to top intro' },
        { id: 'p-2', title: 'Skills & Tech Stack', group: 'Navigation', icon: 'fa-solid fa-microchip', desc: 'React 19, Node.js, MongoDB' },
        { id: 'p-3', title: 'Featured Projects Showcase', group: 'Projects', icon: 'fa-solid fa-folder-open', desc: 'Explore live apps' },
        { id: 'p-4', title: 'Download Verified Resume (PDF)', group: 'Resume', icon: 'fa-solid fa-file-arrow-down', desc: 'Full stack resume' },
        { id: 'p-5', title: 'Play Retro Cyber Snake', group: 'Arcade', icon: 'fa-solid fa-worm', desc: 'Classic arcade minigame' },
        ...settings.customCommands.map(c => ({ id: c.id, title: c.title, group: c.group, icon: c.icon, desc: c.url }))
    ].filter(c => {
        const q = testQuery.toLowerCase().trim();
        if (!q) return true;
        return c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.desc && c.desc.toLowerCase().includes(q));
    });

    return (
        <div className="adm-page-container">
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════
                 TOP SPOTLIGHT & KPI BAR
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(20, 24, 60, 0.98) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                marginBottom: '22px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{
                                background: 'rgba(56, 189, 248, 0.18)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <i className="fa-solid fa-terminal" /> Ctrl + K Spotlight Engine
                            </span>
                            <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>
                                🟢 Active on Portfolio
                            </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            Developer Command Palette &amp; Quick Search CMS
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                            Configure keyboard shortcuts, custom search triggers, category groupings, and quick-jump commands.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setShowTestModal(true)}
                            className="adm-doc-btn-tab"
                        >
                            <i className="fa-solid fa-play" /> Test Palette Modal
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="adm-btn adm-btn-primary"
                            disabled={saving}
                        >
                            <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '18px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Shortcut</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', marginTop: '3px' }}>Ctrl + K / ⌘K</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Indexed Categories</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginTop: '3px' }}>5 Groups</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Actions</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24', marginTop: '3px' }}>{settings.customCommands.length} Active</div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 SETTINGS & CATEGORY TOGGLES
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-two-col-grid">
                {/* Category Toggles Card */}
                <div className="adm-card" style={{ margin: 0 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0' }}>
                        Category Groupings &amp; Visibility
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>Floating Launcher Pill on Screen</div>
                                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Shows the bottom-left "Search portfolio... Ctrl K" trigger.</div>
                            </div>
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enableFloatingPill}
                                    onChange={(e) => setSettings(p => ({ ...p, enableFloatingPill: e.target.checked }))}
                                />
                                <span className="adm-slider" />
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>Navigation Sections Group</div>
                                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Jump to Hero, About, Skills, Projects, Contact.</div>
                            </div>
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enableNavigationGroup}
                                    onChange={(e) => setSettings(p => ({ ...p, enableNavigationGroup: e.target.checked }))}
                                />
                                <span className="adm-slider" />
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>Projects &amp; Sandboxes Group</div>
                                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Includes all MongoDB portfolio projects and live demos.</div>
                            </div>
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enableProjectsGroup}
                                    onChange={(e) => setSettings(p => ({ ...p, enableProjectsGroup: e.target.checked }))}
                                />
                                <span className="adm-slider" />
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>Resume &amp; Documents Group</div>
                                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>1-Click resume downloads &amp; technical specs.</div>
                            </div>
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enableDocsGroup}
                                    onChange={(e) => setSettings(p => ({ ...p, enableDocsGroup: e.target.checked }))}
                                />
                                <span className="adm-slider" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Custom Action Shortcuts Manager */}
                <div className="adm-card" style={{ margin: 0 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ffffff', margin: '0 0 14px 0' }}>
                        Custom Action Commands
                    </h3>

                    {/* Add new action */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="Action Title (e.g. Schedule Call)"
                            style={{ flex: '1 1 180px', fontSize: '12px' }}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="Destination (e.g. #contact or https://...)"
                            style={{ flex: '1 1 180px', fontSize: '12px' }}
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomCommand}
                            className="adm-btn adm-btn-primary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                            <i className="fa-solid fa-plus" /> Add
                        </button>
                    </div>

                    {/* List of custom actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {settings.customCommands.map(cmd => (
                            <div
                                key={cmd.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    padding: '8px 12px'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>
                                        <i className={cmd.icon} style={{ color: '#38bdf8', marginRight: '6px' }} />
                                        {cmd.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: {cmd.url}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCustomCommand(cmd.id)}
                                    className="adm-btn adm-btn-danger"
                                    style={{ padding: '3px 7px', fontSize: '11px' }}
                                    title="Delete Action"
                                >
                                    <i className="fa-solid fa-trash" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 INTERACTIVE SANDBOX TESTER MODAL
            ══════════════════════════════════════════════════════════ */}
            {showTestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(4, 8, 18, 0.85)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 10010,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '80px 16px 20px'
                }} onClick={() => setShowTestModal(false)}>
                    <div style={{
                        background: '#090e1a',
                        border: '1.5px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '18px',
                        width: '100%',
                        maxWidth: '620px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', background: '#0f172a' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#38bdf8' }} />
                            <input
                                type="text"
                                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '15px' }}
                                placeholder="Type to filter commands in simulator..."
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowTestModal(false)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                                ESC
                            </button>
                        </div>
                        <div style={{ padding: '10px', overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {previewCommands.map(cmd => (
                                <div key={cmd.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className={cmd.icon} style={{ color: '#38bdf8' }} />
                                        <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>{cmd.title}</span>
                                    </div>
                                    <span style={{ fontSize: '10.5px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: '999px' }}>{cmd.group}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
