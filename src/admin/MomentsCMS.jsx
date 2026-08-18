// src/admin/MomentsCMS.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getMediaUrl } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = [
    'College Moments',
    'Project Highlights',
    'Hackathons & Events',
    'Milestones',
    'Work & Team',
    'Other'
];

export default function MomentsCMS() {
    const { authFetch } = useAuth();
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMoment, setEditingMoment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: 'College Moments',
        imageUrl: '',
        description: '',
        date: '',
        location: '',
        tags: '',
        featured: false,
        isPublic: true,
        order: 0
    });

    const fetchMoments = async () => {
        try {
            setLoading(true);
            const res = await authFetch(`${API_BASE}/admin/section/moments`);
            if (res.ok) {
                const data = await res.json();
                setMoments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load moments:', err);
            setToast({ type: 'error', title: 'Error', message: 'Failed to fetch moments list.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoments();
    }, []);

    const openAddModal = () => {
        setEditingMoment(null);
        setFormData({
            title: '',
            subtitle: '',
            category: 'College Moments',
            imageUrl: '',
            description: '',
            date: new Date().getFullYear().toString(),
            location: '',
            tags: '',
            featured: false,
            isPublic: true,
            order: moments.length
        });
        setModalOpen(true);
    };

    const openEditModal = (moment) => {
        setEditingMoment(moment);
        setFormData({
            title: moment.title || '',
            subtitle: moment.subtitle || '',
            category: moment.category || 'College Moments',
            imageUrl: moment.imageUrl || '',
            description: moment.description || '',
            date: moment.date || '',
            location: moment.location || '',
            tags: Array.isArray(moment.tags) ? moment.tags.join(', ') : (moment.tags || ''),
            featured: moment.featured ?? false,
            isPublic: moment.isPublic ?? true,
            order: moment.order || 0
        });
        setModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);
        data.append('file', file);
        data.append('folder', 'moments');

        try {
            const res = await authFetch(`${API_BASE}/media/upload`, {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (res.ok && json.url) {
                setFormData(p => ({ ...p, imageUrl: json.url }));
                setToast({ type: 'success', title: 'Upload Complete', message: 'Moment photo uploaded successfully!' });
            } else {
                throw new Error(json.message || 'Upload failed');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Upload Failed', message: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.imageUrl.trim()) {
            setToast({ type: 'error', title: 'Missing Info', message: 'Title and Photo URL are required.' });
            return;
        }

        setSaving(true);
        const payload = {
            ...formData,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        };

        try {
            const url = editingMoment
                ? `${API_BASE}/admin/section/moments/${editingMoment._id}`
                : `${API_BASE}/admin/section/moments`;
            const method = editingMoment ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: editingMoment ? 'Moment Updated' : 'Moment Added',
                    message: `"${formData.title}" is now saved.`
                });
                setModalOpen(false);
                fetchMoments();
            } else {
                const errJson = await res.json();
                throw new Error(errJson.message || 'Save operation failed');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Save Failed', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete moment "${title}"?`)) return;

        try {
            const res = await authFetch(`${API_BASE}/admin/section/moments/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setToast({ type: 'success', title: 'Deleted', message: 'Moment deleted successfully.' });
                fetchMoments();
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Error', message: 'Failed to delete moment.' });
        }
    };

    const handleToggleVisibility = async (id, currentVal) => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/moments/${id}/toggle`, {
                method: 'PATCH',
                body: JSON.stringify({ isPublic: !currentVal })
            });
            if (res.ok) {
                setMoments(p => p.map(m => m._id === id ? { ...m, isPublic: !currentVal } : m));
                setToast({
                    type: 'info',
                    title: 'Visibility Changed',
                    message: `Moment is now ${!currentVal ? 'Public' : 'Hidden'}.`
                });
            }
        } catch (err) {
            console.error('Toggle error:', err);
        }
    };

    const filteredMoments = moments.filter(m => {
        const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
        const q = searchQuery.toLowerCase();
        const matchesQuery = (m.title || '').toLowerCase().includes(q) ||
            (m.subtitle || '').toLowerCase().includes(q) ||
            (m.description || '').toLowerCase().includes(q) ||
            (Array.isArray(m.tags) ? m.tags.join(' ') : '').toLowerCase().includes(q);
        return matchesCat && matchesQuery;
    });

    const publicCount = moments.filter(m => m.isPublic !== false).length;

    return (
        <div className="adm-page-container">
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ── KPI & Header Banner ── */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(24, 24, 68, 0.98) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                marginBottom: '24px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                textTransform: 'uppercase'
                            }}>
                                <i className="fa-solid fa-images" /> Moments Photo Slider CMS
                            </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            Moments &amp; Milestone Photo Gallery
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                            Upload and organize your college memories, hackathon photos, and software milestones shown on the 3D coverflow slider.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="adm-btn adm-btn-primary"
                        >
                            <i className="fa-solid fa-plus" /> Add New Moment
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Moments</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{moments.length}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Live On Portfolio</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{publicCount}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>College Memories</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>
                            {moments.filter(m => m.category === 'College Moments').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Search & Filter Controls ── */}
            <div className="adm-card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="adm-search-input-wrap" style={{ flex: '1 1 240px' }}>
                        <i className="fa-solid fa-magnifying-glass adm-search-icon" />
                        <input
                            type="text"
                            placeholder="Search moments by title, tag, or story..."
                            className="adm-input"
                            style={{ paddingLeft: '38px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="adm-select"
                        style={{ width: '200px' }}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Moments Cards Grid ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#38bdf8' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', marginBottom: '10px' }} />
                    <div>Loading Moments...</div>
                </div>
            ) : filteredMoments.length === 0 ? (
                <div className="adm-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <i className="fa-solid fa-camera-retro" style={{ fontSize: '48px', color: '#475569', marginBottom: '14px' }} />
                    <h3 style={{ color: '#ffffff', margin: '0 0 6px 0' }}>No Moments Found</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px' }}>Click "Add New Moment" to upload your first photo memory.</p>
                    <button type="button" onClick={openAddModal} className="adm-btn adm-btn-primary">
                        <i className="fa-solid fa-plus" /> Add Moment
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                    {filteredMoments.map((item) => (
                        <div
                            key={item._id}
                            className="adm-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                padding: 0,
                                border: '1px solid rgba(255, 255, 255, 0.09)'
                            }}
                        >
                            {/* Image Header */}
                            <div style={{ position: 'relative', height: '180px', background: '#000' }}>
                                <img
                                    src={getMediaUrl(item.imageUrl)}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'rgba(15, 23, 42, 0.85)',
                                    backdropFilter: 'blur(8px)',
                                    color: '#38bdf8',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                }}>
                                    {item.category}
                                </div>
                                {item.date && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        color: '#cbd5e1',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px'
                                    }}>
                                        <i className="fa-solid fa-calendar-days" /> {item.date}
                                    </div>
                                )}
                            </div>

                            {/* Content Body */}
                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ color: '#ffffff', fontSize: '15px', margin: '0 0 4px 0', fontWeight: '700' }}>
                                    {item.title}
                                </h4>
                                {item.subtitle && (
                                    <div style={{ fontSize: '12px', color: '#c084fc', marginBottom: '8px' }}>
                                        {item.subtitle}
                                    </div>
                                )}
                                <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 12px 0', flex: 1 }}>
                                    {(item.description || '').slice(0, 110)}
                                    {(item.description || '').length > 110 ? '...' : ''}
                                </p>

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                        {item.tags.map((t, ti) => (
                                            <span key={ti} style={{ fontSize: '10.5px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px' }}>
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Bottom Actions Bar */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: item.isPublic !== false ? '#34d399' : '#64748b' }}>
                                        <input
                                            type="checkbox"
                                            checked={item.isPublic !== false}
                                            onChange={() => handleToggleVisibility(item._id, item.isPublic !== false)}
                                        />
                                        <span>{item.isPublic !== false ? 'Visible' : 'Hidden'}</span>
                                    </label>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="adm-btn adm-btn-secondary"
                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                            title="Edit Moment"
                                        >
                                            <i className="fa-solid fa-pen-to-square" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item._id, item.title)}
                                            className="adm-btn adm-btn-danger"
                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                            title="Delete Moment"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                 ADD / EDIT MOMENT MODAL
            ══════════════════════════════════════════════════════════ */}
            {modalOpen && (
                <div className="adm-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="adm-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div className="adm-modal-header">
                            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>
                                <i className="fa-solid fa-camera-retro" style={{ color: '#38bdf8', marginRight: '8px' }} />
                                {editingMoment ? 'Edit Moment Memory' : 'Add New Moment Memory'}
                            </h3>
                            <button type="button" className="adm-modal-close" onClick={() => setModalOpen(false)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="adm-modal-body">
                            {/* Title & Subtitle */}
                            <div className="adm-form-group">
                                <label className="adm-label">Moment Headline / Title *</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="e.g. College Hackathon Champions 🏆"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="adm-form-group">
                                    <label className="adm-label">Subtitle / Event Context</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="e.g. B.Tech Final Year • 36h Sprint"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData(p => ({ ...p, subtitle: e.target.value }))}
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Category</label>
                                    <select
                                        className="adm-select"
                                        value={formData.category}
                                        onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Photo Upload / Image URL */}
                            <div className="adm-form-group">
                                <label className="adm-label">Photo / Image *</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Paste image URL (https://...) or upload file below"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="adm-btn adm-btn-secondary"
                                        disabled={uploading}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {uploading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-cloud-arrow-up" />} Upload
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                {formData.imageUrl && (
                                    <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                                        <img
                                            src={getMediaUrl(formData.imageUrl)}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Story Description Textarea */}
                            <div className="adm-form-group">
                                <label className="adm-label">Story Narrative / Details</label>
                                <textarea
                                    className="adm-textarea"
                                    rows={3}
                                    placeholder="Write a short story or memory behind this moment..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            {/* Date, Location, Tags */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="adm-form-group">
                                    <label className="adm-label">Date / Period</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="e.g. March 2024"
                                        value={formData.date}
                                        onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Location</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="e.g. Haldia Auditorium, WB"
                                        value={formData.location}
                                        onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="Hackathon, Team Alpha, 1st Prize, Campus"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                                />
                            </div>

                            {/* Visibility check */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ffffff', fontSize: '13px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))}
                                    />
                                    <span>Make Visible on Portfolio Slider</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="adm-btn adm-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="adm-btn adm-btn-primary"
                                    disabled={saving}
                                >
                                    <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving...' : 'Save Moment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
