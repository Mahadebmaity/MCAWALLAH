import { useState } from 'react';
import ToastNotification from './ToastNotification';
import CommandPalette from '../components/CommandPalette/CommandPalette';
import './admin.css';

export default function CommandPaletteCMS() {
    const [toast, setToast] = useState(null);
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

    const [saving, setSaving] = useState(false);
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
                title: 'Command Palette Saved! ⚡',
                message: 'All keyboard shortcut settings & custom commands are active live.'
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
    };

    const handleRemoveCustomCommand = (id) => {
        setSettings(p => ({
            ...p,
            customCommands: p.customCommands.filter(c => c.id !== id)
        }));
    };

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

                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="adm-btn adm-btn-primary"
                        disabled={saving}
                    >
                        <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
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
                            <i className="fa-solid fa-plus" /> Add Command
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

            {/* Test Launcher helper */}
            <CommandPalette />
        </div>
    );
}
