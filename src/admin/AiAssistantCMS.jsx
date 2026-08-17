import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function AiAssistantCMS() {
    const { authFetch } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'config' | 'prompts' | 'tester'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // AI Settings State
    const [settings, setSettings] = useState({
        enabled: true,
        twinName: "Mahadeb's AI Digital Twin",
        welcomeMessage: "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!",
        quickPrompts: [],
        customInstructions: "Represent Mahadeb professionally as a Full Stack Engineer. Highlight his React 19, Node.js, and MongoDB expertise.",
        geminiApiKey: '',
        preferredEngine: 'auto'
    });

    // Analytics & Logs State
    const [analytics, setAnalytics] = useState({
        totalChats: 0,
        todayCount: 0,
        topicStats: { skills: 0, projects: 0, resumes: 0, contact: 0, arcade: 0, general: 0 },
        logs: []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [clearingLogs, setClearingLogs] = useState(false);

    // Prompt chip input state
    const [newPromptInput, setNewPromptInput] = useState('');

    // Interactive Admin Tester state
    const [testQuery, setTestQuery] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const [testResponse, setTestResponse] = useState(null);

    const fetchAllAiData = async () => {
        try {
            setLoading(true);
            const [settingsRes, analyticsRes] = await Promise.all([
                authFetch(`${API_BASE}/portfolio/ai/admin/settings`),
                authFetch(`${API_BASE}/portfolio/ai/admin/analytics?limit=150`)
            ]);

            if (settingsRes.ok) {
                const sData = await settingsRes.json();
                setSettings(sData);
            }
            if (analyticsRes.ok) {
                const aData = await analyticsRes.json();
                setAnalytics(aData);
            }
        } catch (err) {
            console.error('Failed to load AI Admin data:', err);
            setToast({ type: 'error', title: 'Error', message: 'Failed to load AI Assistant configurations.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAiData();
    }, []);

    // Save Settings
    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const res = await authFetch(`${API_BASE}/portfolio/ai/admin/settings`, {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setToast({
                    type: 'success',
                    title: 'Settings Saved! 🤖',
                    message: 'AI Assistant parameters and behaviors have been updated live.',
                    duration: 4000
                });
                fetchAllAiData();
            } else {
                throw new Error(data.message || 'Failed to update settings');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Update Failed', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Add Prompt Chip
    const handleAddPrompt = () => {
        if (!newPromptInput.trim()) return;
        const updated = [...(settings.quickPrompts || []), newPromptInput.trim()];
        setSettings(p => ({ ...p, quickPrompts: updated }));
        setNewPromptInput('');
    };

    // Remove Prompt Chip
    const handleRemovePrompt = (idx) => {
        const updated = settings.quickPrompts.filter((_, i) => i !== idx);
        setSettings(p => ({ ...p, quickPrompts: updated }));
    };

    // Clear Logs
    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to purge all AI interaction history logs?')) return;
        setClearingLogs(true);
        try {
            const res = await authFetch(`${API_BASE}/portfolio/ai/admin/analytics`, { method: 'DELETE' });
            if (res.ok) {
                setToast({ type: 'success', title: 'Logs Cleared', message: 'AI chat history purged successfully.' });
                fetchAllAiData();
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Error', message: err.message });
        } finally {
            setClearingLogs(false);
        }
    };

    // Live Admin AI Tester Query
    const handleRunTestQuery = async (e) => {
        e.preventDefault();
        if (!testQuery.trim() || testLoading) return;
        setTestLoading(true);
        setTestResponse(null);
        try {
            const res = await fetch(`${API_BASE}/portfolio/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: testQuery.trim() })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTestResponse(data);
            } else {
                throw new Error(data.message || 'Test query failed');
            }
        } catch (err) {
            setTestResponse({ error: err.message });
        } finally {
            setTestLoading(false);
        }
    };

    const filteredLogs = analytics.logs.filter(log => {
        const q = (log.metadata?.query || log.details || '').toLowerCase();
        return q.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="adm-page-container">
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════
                 TOP SPOTLIGHT & METRICS CARDS
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                marginBottom: '24px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{
                                background: settings.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                border: `1px solid ${settings.enabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                color: settings.enabled ? '#34d399' : '#f87171',
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
                                <i className="fa-solid fa-circle" style={{ fontSize: '7px' }} />
                                {settings.enabled ? 'AI Assistant Active' : 'AI Assistant Paused'}
                            </span>

                            <span style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '4px 10px',
                                borderRadius: '999px'
                            }}>
                                <i className="fa-solid fa-microchip" /> Engine: {settings.hasActiveKey ? 'Gemini 3.6 Flash' : 'Semantic Knowledge Engine'}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            AI Assistant &amp; Intelligence Hub
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                            Monitor visitor queries in real time, customize persona instructions, configure prompt chips, and test replies.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={fetchAllAiData}
                            className="adm-btn adm-btn-secondary"
                            disabled={loading}
                        >
                            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Questions</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{analytics.totalChats}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asked Today</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{analytics.todayCount}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills Queries</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>{analytics.topicStats?.skills || 0}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects &amp; Resumes</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
                            {(analytics.topicStats?.projects || 0) + (analytics.topicStats?.resumes || 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 TABBED NAVIGATION
            ══════════════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--adm-border)', marginBottom: '22px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`adm-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    style={{
                        background: activeTab === 'analytics' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'analytics' ? '#38bdf8' : '#94a3b8',
                        border: activeTab === 'analytics' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fa-solid fa-chart-line" /> Visitor Questions &amp; Logs ({analytics.totalChats})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    className={`adm-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                    style={{
                        background: activeTab === 'config' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'config' ? '#38bdf8' : '#94a3b8',
                        border: activeTab === 'config' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fa-solid fa-sliders" /> Persona &amp; Settings
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('prompts')}
                    className={`adm-tab-btn ${activeTab === 'prompts' ? 'active' : ''}`}
                    style={{
                        background: activeTab === 'prompts' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'prompts' ? '#38bdf8' : '#94a3b8',
                        border: activeTab === 'prompts' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fa-solid fa-lightbulb" /> Suggested Prompt Chips
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('tester')}
                    className={`adm-tab-btn ${activeTab === 'tester' ? 'active' : ''}`}
                    style={{
                        background: activeTab === 'tester' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'tester' ? '#38bdf8' : '#94a3b8',
                        border: activeTab === 'tester' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fa-solid fa-vial" /> Live Assistant Tester
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 TAB 1: VISITOR QUESTION LOGS & ANALYTICS
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'analytics' && (
                <div className="adm-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
                            <div className="adm-search-input-wrap" style={{ width: '100%' }}>
                                <i className="fa-solid fa-magnifying-glass adm-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search visitor questions or details..."
                                    className="adm-input"
                                    style={{ paddingLeft: '38px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClearLogs}
                            className="adm-btn adm-btn-danger"
                            disabled={clearingLogs || analytics.logs.length === 0}
                            style={{ fontSize: '12px' }}
                        >
                            <i className="fa-solid fa-trash" /> Purge Chat History
                        </button>
                    </div>

                    {filteredLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--adm-text-muted)' }}>
                            <i className="fa-solid fa-comments" style={{ fontSize: '38px', color: '#64748b', marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '14px' }}>No visitor questions recorded yet. Try asking a question from the portfolio!</p>
                        </div>
                    ) : (
                        <div className="adm-table-wrap">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '180px' }}>Timestamp</th>
                                        <th style={{ width: '140px' }}>User / IP</th>
                                        <th>Question / Interaction</th>
                                        <th style={{ width: '140px' }}>Engine Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td style={{ fontSize: '12px' }}>
                                                <div style={{ fontWeight: '600', color: '#ffffff' }}>{log.userName}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{log.ipAddress || 'Client'}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#38bdf8', fontSize: '13px' }}>
                                                    {log.metadata?.query || log.details}
                                                </div>
                                                {log.metadata?.replySnippet && (
                                                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                                                        AI: {log.metadata.replySnippet}...
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '11px',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: log.metadata?.engine?.includes('gemini') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                                    color: log.metadata?.engine?.includes('gemini') ? '#38bdf8' : '#c084fc',
                                                    fontWeight: '700'
                                                }}>
                                                    {log.metadata?.engine || 'semantic'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                 TAB 2: PERSONA & SETTINGS
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'config' && (
                <form onSubmit={handleSaveSettings} className="adm-card" style={{ maxWidth: '800px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0' }}>
                        AI Persona &amp; Behavior Configuration
                    </h3>

                    {/* Enable Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '18px' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>Enable AI Floating Assistant Widget</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Show the interactive AI digital twin launcher across the public portfolio.</div>
                        </div>
                        <label className="adm-switch">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => setSettings(p => ({ ...p, enabled: e.target.checked }))}
                            />
                            <span className="adm-slider" />
                        </label>
                    </div>

                    {/* Twin Name */}
                    <div className="adm-form-group">
                        <label className="adm-label">Assistant Display Name</label>
                        <input
                            type="text"
                            className="adm-input"
                            value={settings.twinName}
                            onChange={(e) => setSettings(p => ({ ...p, twinName: e.target.value }))}
                            placeholder="e.g. Mahadeb's AI Digital Twin"
                            required
                        />
                    </div>

                    {/* Welcome Greeting */}
                    <div className="adm-form-group">
                        <label className="adm-label">Welcome Greeting Message (Markdown Supported)</label>
                        <textarea
                            className="adm-textarea"
                            rows={4}
                            value={settings.welcomeMessage}
                            onChange={(e) => setSettings(p => ({ ...p, welcomeMessage: e.target.value }))}
                            placeholder="Type the greeting message visitors see when opening the assistant..."
                            required
                        />
                    </div>

                    {/* System Persona Instructions */}
                    <div className="adm-form-group">
                        <label className="adm-label">System Persona Guidelines &amp; Custom Instructions</label>
                        <textarea
                            className="adm-textarea"
                            rows={3}
                            value={settings.customInstructions}
                            onChange={(e) => setSettings(p => ({ ...p, customInstructions: e.target.value }))}
                            placeholder="e.g. Speak with technical confidence, highlight React and Node skills, mention resume download..."
                        />
                    </div>

                    {/* Gemini API Key */}
                    <div className="adm-form-group">
                        <label className="adm-label">
                            Google Gemini API Key (Optional — Supports Gemini 3.6 Flash)
                        </label>
                        <input
                            type="text"
                            className="adm-input"
                            value={settings.geminiApiKey}
                            onChange={(e) => setSettings(p => ({ ...p, geminiApiKey: e.target.value }))}
                            placeholder="AIzaSy... (Leave empty to use built-in offline Semantic Knowledge Engine)"
                        />
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                            💡 If no key is entered, the assistant uses the built-in deterministic Knowledge Graph to answer questions with zero API costs.
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            className="adm-btn adm-btn-primary"
                            disabled={saving}
                        >
                            <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving Changes...' : 'Save AI Settings'}
                        </button>
                    </div>
                </form>
            )}

            {/* ══════════════════════════════════════════════════════════
                 TAB 3: QUICK PROMPT CHIPS BUILDER
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'prompts' && (
                <div className="adm-card" style={{ maxWidth: '800px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
                        Suggested Prompt Chips Manager
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 18px 0' }}>
                        These quick-tap question pills appear above the chat input to guide recruiters and visitors.
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="e.g. 📄 Download latest resume..."
                            value={newPromptInput}
                            onChange={(e) => setNewPromptInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrompt(); } }}
                        />
                        <button
                            type="button"
                            onClick={handleAddPrompt}
                            className="adm-btn adm-btn-primary"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <i className="fa-solid fa-plus" /> Add Chip
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(settings.quickPrompts || []).map((prompt, pIdx) => (
                            <div
                                key={pIdx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '10px 14px'
                                }}
                            >
                                <span style={{ color: '#f1f5f9', fontSize: '13px' }}>{prompt}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemovePrompt(pIdx)}
                                    className="adm-btn adm-btn-danger"
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                    title="Delete Chip"
                                >
                                    <i className="fa-solid fa-trash" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => handleSaveSettings()}
                            className="adm-btn adm-btn-primary"
                            disabled={saving}
                        >
                            <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving...' : 'Save Quick Prompts'}
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                 TAB 4: LIVE ASSISTANT TESTER PLAYGROUND
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'tester' && (
                <div className="adm-card" style={{ maxWidth: '800px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
                        Live AI Assistant Sandbox
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 18px 0' }}>
                        Test questions against your portfolio knowledge base in real time without opening the public site.
                    </p>

                    <form onSubmit={handleRunTestQuery} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="Type a test question (e.g., 'What React projects has Mahadeb built?')..."
                            value={testQuery}
                            onChange={(e) => setTestQuery(e.target.value)}
                            disabled={testLoading}
                        />
                        <button
                            type="submit"
                            className="adm-btn adm-btn-primary"
                            disabled={!testQuery.trim() || testLoading}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {testLoading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-paper-plane" />} Run Test
                        </button>
                    </form>

                    {testResponse && (
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1.5px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '12px',
                            padding: '16px 18px',
                            marginTop: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
                                    <i className="fa-solid fa-robot" /> Assistant Response ({testResponse.source || 'Engine'})
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date().toLocaleTimeString()}</span>
                            </div>

                            {testResponse.error ? (
                                <div style={{ color: '#f87171', fontSize: '13px' }}>Error: {testResponse.error}</div>
                            ) : (
                                <>
                                    <div style={{ color: '#ffffff', fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {testResponse.reply}
                                    </div>

                                    {testResponse.actionCards && testResponse.actionCards.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                            {testResponse.actionCards.map((card, cIdx) => (
                                                <span key={cIdx} style={{ fontSize: '11.5px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px' }}>
                                                    <i className={card.icon} /> {card.title}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
