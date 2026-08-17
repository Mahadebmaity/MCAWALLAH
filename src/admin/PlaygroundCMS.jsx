import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import PlaygroundModal from '../components/Playground/PlaygroundModal';
import './admin.css';

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Interactive Games', 'Python / AI', 'Tools & Utilities'];

export default function PlaygroundCMS() {
    const { authFetch } = useAuth();
    const [playgrounds, setPlaygrounds] = useState([]);
    const [stats, setStats] = useState({ totalCount: 0, publicCount: 0, totalViews: 0, totalCodeSnippets: 0 });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal Form State (Create / Edit)
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        category: 'Full Stack',
        description: '',
        liveUrl: '',
        githubUrl: '',
        tags: '',
        devicePresets: { desktop: true, tablet: true, mobile: true },
        defaultView: 'live',
        codeSnippets: [],
        architectureNotes: '',
        isPublic: true,
        order: 0
    });

    // Snippet sub-form state
    const [newSnippetTitle, setNewSnippetTitle] = useState('');
    const [newSnippetLanguage, setNewSnippetLanguage] = useState('javascript');
    const [newSnippetCode, setNewSnippetCode] = useState('');

    // Live Admin Preview state
    const [previewPlayground, setPreviewPlayground] = useState(null);

    const fetchPlaygrounds = async () => {
        try {
            setLoading(true);
            const res = await authFetch(`${API_BASE}/portfolio/playgrounds/admin/all`);
            if (res.ok) {
                const data = await res.json();
                setPlaygrounds(data.playgrounds || []);
                setStats(data.stats || {});
            }
        } catch (err) {
            console.error('Error loading playgrounds:', err);
            setToast({ type: 'error', title: 'Error', message: 'Failed to load project playgrounds.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaygrounds();
    }, []);

    const handleOpenCreateModal = () => {
        setEditId(null);
        setForm({
            title: '',
            slug: '',
            category: 'Full Stack',
            description: '',
            liveUrl: '',
            githubUrl: '',
            tags: '',
            devicePresets: { desktop: true, tablet: true, mobile: true },
            defaultView: 'live',
            codeSnippets: [],
            architectureNotes: '',
            isPublic: true,
            order: playgrounds.length
        });
        setNewSnippetTitle('');
        setNewSnippetCode('');
        setShowModal(true);
    };

    const handleOpenEditModal = (pg) => {
        setEditId(pg._id);
        setForm({
            title: pg.title || '',
            slug: pg.slug || '',
            category: pg.category || 'Full Stack',
            description: pg.description || '',
            liveUrl: pg.liveUrl || '',
            githubUrl: pg.githubUrl || '',
            tags: (pg.tags || []).join(', '),
            devicePresets: pg.devicePresets || { desktop: true, tablet: true, mobile: true },
            defaultView: pg.defaultView || 'live',
            codeSnippets: pg.codeSnippets || [],
            architectureNotes: pg.architectureNotes || '',
            isPublic: pg.isPublic !== false,
            order: pg.order || 0
        });
        setShowModal(true);
    };

    const handleAddSnippet = () => {
        if (!newSnippetTitle.trim() || !newSnippetCode.trim()) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Snippet filename and code are required.' });
            return;
        }
        setForm(p => ({
            ...p,
            codeSnippets: [...p.codeSnippets, {
                title: newSnippetTitle.trim(),
                language: newSnippetLanguage,
                code: newSnippetCode.trim()
            }]
        }));
        setNewSnippetTitle('');
        setNewSnippetCode('');
    };

    const handleRemoveSnippet = (idx) => {
        setForm(p => ({
            ...p,
            codeSnippets: p.codeSnippets.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Project title is required.' });
            return;
        }

        setSaving(true);
        try {
            const url = editId
                ? `${API_BASE}/portfolio/playgrounds/admin/${editId}`
                : `${API_BASE}/portfolio/playgrounds/admin`;
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setToast({
                    type: 'success',
                    title: editId ? 'Playground Updated! ⚡' : 'Playground Created! 🚀',
                    message: data.message || 'Saved successfully.'
                });
                setShowModal(false);
                fetchPlaygrounds();
            } else {
                throw new Error(data.message || 'Operation failed');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Save Failed', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete playground sandbox "${title}"?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/portfolio/playgrounds/admin/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setToast({ type: 'success', title: 'Deleted', message: `Sandbox "${title}" removed.` });
                fetchPlaygrounds();
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Delete Failed', message: err.message });
        }
    };

    const handleToggleVisibility = async (pg) => {
        try {
            const res = await authFetch(`${API_BASE}/portfolio/playgrounds/admin/${pg._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isPublic: !pg.isPublic })
            });
            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Status Updated',
                    message: `Playground is now ${!pg.isPublic ? 'Public 🟢' : 'Draft 🔒'}`
                });
                fetchPlaygrounds();
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Update Failed', message: err.message });
        }
    };

    const filteredPlaygrounds = playgrounds.filter(pg => {
        const matchesCategory = selectedCategory === 'All' || pg.category === selectedCategory;
        const matchesSearch = pg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (pg.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="adm-page-container">
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════
                 TOP SPOTLIGHT & KPI METRICS BAR
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(20, 24, 60, 0.98) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                marginBottom: '24px',
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
                                <i className="fa-solid fa-laptop-code" /> Interactive Project Sandbox Engine
                            </span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                                {stats.publicCount} Live Sandboxes
                            </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            Project Live Playground &amp; Code Sandbox CMS
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                            Configure inline embedded app frames, responsive device viewports (Desktop/Tablet/Mobile), multi-file code inspectors, and architecture notes.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="adm-btn adm-btn-primary"
                        >
                            <i className="fa-solid fa-plus" /> Create New Sandbox
                        </button>

                        <button
                            type="button"
                            onClick={fetchPlaygrounds}
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
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sandboxes</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{stats.totalCount}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Public Demos</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{stats.publicCount}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Interactions</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>{stats.totalViews}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code Snippets</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>{stats.totalCodeSnippets}</div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 FILTERING & CONTROLS
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`adm-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                                style={{
                                    background: selectedCategory === cat ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                                    color: selectedCategory === cat ? '#38bdf8' : '#94a3b8',
                                    border: selectedCategory === cat ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="adm-search-input-wrap" style={{ width: '260px' }}>
                        <i className="fa-solid fa-magnifying-glass adm-search-icon" />
                        <input
                            type="text"
                            placeholder="Search sandboxes, tags..."
                            className="adm-input"
                            style={{ paddingLeft: '36px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                     PLAYGROUND SANDBOXES GRID / LIST
                ══════════════════════════════════════════════════════════ */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px' }} />
                        <p>Loading project playgrounds...</p>
                    </div>
                ) : filteredPlaygrounds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                        <i className="fa-solid fa-laptop-code" style={{ fontSize: '42px', color: '#64748b', marginBottom: '14px' }} />
                        <h4 style={{ color: '#ffffff', margin: '0 0 8px 0' }}>No Project Sandboxes Found</h4>
                        <p style={{ maxWidth: '420px', margin: '0 auto 20px auto', fontSize: '13px' }}>
                            Create your first interactive sandbox demo with live preview and code breakdown!
                        </p>
                        <button type="button" onClick={handleOpenCreateModal} className="adm-btn adm-btn-primary">
                            <i className="fa-solid fa-plus" /> Create Sandbox
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
                        {filteredPlaygrounds.map(pg => (
                            <div
                                key={pg._id}
                                className="adm-card"
                                style={{
                                    margin: 0,
                                    background: 'rgba(15, 23, 42, 0.7)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.09)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            color: '#38bdf8',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '3px 10px',
                                            borderRadius: '999px'
                                        }}>
                                            {pg.category}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleToggleVisibility(pg)}
                                            style={{
                                                background: pg.isPublic ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                border: `1px solid ${pg.isPublic ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                                color: pg.isPublic ? '#34d399' : '#f87171',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                            title="Click to toggle public status"
                                        >
                                            {pg.isPublic ? '🟢 Public' : '🔒 Draft'}
                                        </button>
                                    </div>

                                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                                        {pg.title}
                                    </h3>
                                    <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                                        {pg.description || 'Interactive live working preview & architecture sandbox.'}
                                    </p>

                                    {/* Tech Tags */}
                                    {pg.tags && pg.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                            {pg.tags.map((t, idx) => (
                                                <span key={idx} style={{ fontSize: '10.5px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '2px 7px', borderRadius: '4px' }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Card Action Bar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewPlayground(pg)}
                                        className="adm-doc-btn-tab"
                                        style={{ padding: '6px 12px', fontSize: '11.5px' }}
                                    >
                                        <i className="fa-solid fa-play" /> Test Live
                                    </button>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(pg)}
                                            className="adm-btn adm-btn-secondary"
                                            style={{ padding: '6px 10px', fontSize: '11.5px' }}
                                            title="Edit Sandbox"
                                        >
                                            <i className="fa-solid fa-pen-to-square" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(pg._id, pg.title)}
                                            className="adm-btn adm-btn-danger"
                                            style={{ padding: '6px 10px', fontSize: '11.5px' }}
                                            title="Delete Sandbox"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                 CREATE / EDIT PLAYGROUND MODAL
            ══════════════════════════════════════════════════════════ */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(5, 8, 16, 0.88)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10002,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--adm-surface, #0f172a)',
                        border: '1.5px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '780px',
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#ffffff', fontWeight: '700' }}>
                                {editId ? '⚡ Edit Project Sandbox' : '🚀 Create New Project Sandbox'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="adm-form-group">
                                    <label className="adm-label">Project Title</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={form.title}
                                        onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. MCA WALLAH Portfolio & CMS"
                                        required
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Category</label>
                                    <select
                                        className="adm-select"
                                        value={form.category}
                                        onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                                    >
                                        <option value="Full Stack">Full Stack</option>
                                        <option value="Frontend">Frontend</option>
                                        <option value="Interactive Games">Interactive Games</option>
                                        <option value="Python / AI">Python / AI</option>
                                        <option value="Tools & Utilities">Tools &amp; Utilities</option>
                                    </select>
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Live Embedded App URL (iframe preview)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={form.liveUrl}
                                    onChange={(e) => setForm(p => ({ ...p, liveUrl: e.target.value }))}
                                    placeholder="e.g. https://your-demo.vercel.app or http://localhost:5173"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">GitHub Repository URL</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={form.githubUrl}
                                    onChange={(e) => setForm(p => ({ ...p, githubUrl: e.target.value }))}
                                    placeholder="https://github.com/Mahadebmaity/..."
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Tech Stack Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={form.tags}
                                    onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                                    placeholder="React 19, Node.js, Express, MongoDB, Vite"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Description / Feature Overview</label>
                                <textarea
                                    className="adm-textarea"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Highlight what recruiters and visitors can test in this live sandbox..."
                                />
                            </div>

                            {/* Code Snippets Manager */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', fontWeight: '700' }}>
                                    <i className="fa-solid fa-code" /> Code Breakdown Snippets ({form.codeSnippets.length})
                                </h4>

                                {/* Existing snippets list */}
                                {form.codeSnippets.map((snip, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 12px', borderRadius: '6px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '12px', color: '#e2e8f0' }}>
                                            <i className="fa-solid fa-file-code" style={{ color: '#38bdf8', marginRight: '6px' }} />
                                            <strong>{snip.title}</strong> ({snip.language})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSnippet(idx)}
                                            className="adm-btn adm-btn-danger"
                                            style={{ padding: '2px 6px', fontSize: '10.5px' }}
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add snippet box */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginTop: '10px' }}>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Filename (e.g., App.jsx, controller.js)"
                                        value={newSnippetTitle}
                                        onChange={(e) => setNewSnippetTitle(e.target.value)}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <select
                                        className="adm-select"
                                        value={newSnippetLanguage}
                                        onChange={(e) => setNewSnippetLanguage(e.target.value)}
                                        style={{ fontSize: '12px' }}
                                    >
                                        <option value="javascript">JavaScript / React</option>
                                        <option value="html">HTML</option>
                                        <option value="css">CSS</option>
                                        <option value="python">Python</option>
                                        <option value="json">JSON / API</option>
                                    </select>
                                </div>
                                <textarea
                                    className="adm-textarea"
                                    rows={3}
                                    placeholder="Paste code snippet here..."
                                    value={newSnippetCode}
                                    onChange={(e) => setNewSnippetCode(e.target.value)}
                                    style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '11.5px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSnippet}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ marginTop: '8px', width: '100%', fontSize: '12px' }}
                                >
                                    <i className="fa-solid fa-plus" /> Add Code Snippet File
                                </button>
                            </div>

                            {/* Architecture Notes */}
                            <div className="adm-form-group">
                                <label className="adm-label">Architecture &amp; System Design Notes</label>
                                <textarea
                                    className="adm-textarea"
                                    rows={3}
                                    value={form.architectureNotes}
                                    onChange={(e) => setForm(p => ({ ...p, architectureNotes: e.target.value }))}
                                    placeholder="Explain the architectural pattern, state management, caching, or backend contracts..."
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="adm-btn adm-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="adm-btn adm-btn-primary"
                                    disabled={saving}
                                >
                                    <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving...' : 'Save Sandbox'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                 LIVE ADMIN TESTER PREVIEW MODAL
            ══════════════════════════════════════════════════════════ */}
            {previewPlayground && (
                <PlaygroundModal
                    playground={previewPlayground}
                    onClose={() => setPreviewPlayground(null)}
                />
            )}
        </div>
    );
}
