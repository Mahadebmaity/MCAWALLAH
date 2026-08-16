import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

const TIMELINE_ICON_PRESETS = [
    { icon: 'fa-solid fa-briefcase', label: 'Job / Work' },
    { icon: 'fa-solid fa-graduation-cap', label: 'Degree / College' },
    { icon: 'fa-solid fa-laptop-code', label: 'Developer' },
    { icon: 'fa-solid fa-building', label: 'Enterprise' },
    { icon: 'fa-solid fa-rocket', label: 'Startup' },
    { icon: 'fa-solid fa-certificate', label: 'Certification' },
    { icon: 'fa-solid fa-school', label: 'School' },
    { icon: 'fa-solid fa-globe', label: 'Remote' },
    { icon: 'fa-solid fa-award', label: 'Honor / Award' },
    { icon: 'fa-solid fa-user-graduate', label: 'Masters / PG' }
];

export default function TimelineCMS() {
    const { authFetch } = useAuth();
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    const [formData, setFormData] = useState({
        type: 'experience',
        year: '2024',
        title: '',
        place: '',
        desc: '',
        icon: 'fa-solid fa-briefcase',
        isPublic: true
    });

    const fetchTimeline = async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/timeline`);
            if (res.ok) {
                const data = await res.json();
                setTimeline(data);
            }
        } catch (err) {
            console.error('Failed to load timeline:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, []);

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            type: 'experience',
            year: new Date().getFullYear().toString(),
            title: '',
            place: '',
            desc: '',
            icon: 'fa-solid fa-briefcase',
            isPublic: true
        });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            type: item.type || 'experience',
            year: item.year,
            title: item.title,
            place: item.place,
            desc: item.desc,
            icon: item.icon || (item.type === 'education' ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-briefcase'),
            isPublic: item.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            const url = editingItem
                ? `${API_BASE}/admin/section/timeline/${editingItem._id}`
                : `${API_BASE}/admin/section/timeline`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchTimeline();
                setToast({
                    type: 'success',
                    title: editingItem ? 'Milestone Updated! 📅' : 'New Milestone Added! 🚀',
                    message: `"${formData.title}" (${formData.year}) is saved.`
                });
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error Saving Milestone',
                message: err.message
            });
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title || 'this timeline entry'}"?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/section/timeline/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setTimeline(prev => prev.filter(t => t._id !== id));
                setToast({
                    type: 'success',
                    title: 'Milestone Deleted',
                    message: `"${title || 'Entry'}" has been removed.`
                });
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Delete Failed',
                message: err.message
            });
        }
    };

    const toggleVisibility = async (id, title) => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/timeline/${id}/visibility`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const data = await res.json();
                setTimeline(prev => prev.map(t => t._id === id ? { ...t, isPublic: data.item.isPublic } : t));
                setToast({
                    type: 'success',
                    title: data.item.isPublic ? 'Milestone Public 🌐' : 'Milestone Private 🔒',
                    message: `"${title || 'Milestone'}" is ${data.item.isPublic ? 'visible to visitors' : 'hidden from public view'}.`
                });
            }
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Timeline...</div>;

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <div className="adm-card">
                <div className="adm-card-header">
                    <div>
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-timeline" style={{ color: 'var(--adm-primary)' }}></i>
                            Experience &amp; Education Timeline ({timeline.length})
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                            Manage your career milestones, job roles, and academic qualifications.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* View Switcher: Mobile Optimized Cards vs Table */}
                        <div style={{ display: 'inline-flex', background: 'var(--adm-surface-2)', padding: '3px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                style={{
                                    border: 'none',
                                    background: viewMode === 'cards' ? 'var(--adm-primary)' : 'transparent',
                                    color: viewMode === 'cards' ? '#090d16' : 'var(--adm-text-muted)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fa-solid fa-grip-vertical" /> Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                style={{
                                    border: 'none',
                                    background: viewMode === 'table' ? 'var(--adm-primary)' : 'transparent',
                                    color: viewMode === 'table' ? '#090d16' : 'var(--adm-text-muted)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fa-solid fa-table-list" /> Table
                            </button>
                        </div>

                        <button onClick={openAddModal} className="adm-btn adm-btn-primary">
                            <i className="fa-solid fa-plus"></i> Add Entry
                        </button>
                    </div>
                </div>

                {/* ══ Cards View (Super clean and perfectly readable on mobile and desktop) ══ */}
                {viewMode === 'cards' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {timeline.map((item) => {
                            const isEdu = item.type === 'education';
                            return (
                                <div
                                    key={item._id}
                                    style={{
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        borderRadius: '14px',
                                        padding: '16px 18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/* Top Row: Year Badge, Type Badge & Visibility Switch */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                color: '#fff',
                                                background: isEdu ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                                border: `1px solid ${isEdu ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                                                padding: '3px 10px',
                                                borderRadius: '999px',
                                                fontFamily: 'monospace'
                                            }}>
                                                {item.year}
                                            </span>

                                            <span style={{
                                                textTransform: 'capitalize',
                                                fontSize: '11.5px',
                                                fontWeight: '700',
                                                color: isEdu ? '#10b981' : '#38bdf8',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--adm-border)'
                                            }}>
                                                <i className={item.icon || (isEdu ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-briefcase')} style={{ marginRight: '5px' }} />
                                                {isEdu ? 'Education' : 'Experience'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleVisibility(item._id, item.title)}
                                                className={`adm-status-tag ${item.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                                style={{ cursor: 'pointer', border: 'none', fontSize: '11px', padding: '3px 8px' }}
                                                title="Toggle Public / Private"
                                            >
                                                {item.isPublic ? '● Public' : '○ Private'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Block */}
                                    <div>
                                        <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: 'var(--adm-text-main)' }}>
                                            {item.title}
                                        </h4>
                                        <div style={{ fontSize: '13px', color: 'var(--adm-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <i className="fa-solid fa-location-dot" style={{ fontSize: '11px', opacity: 0.8 }} />
                                            {item.place || 'Organization'}
                                        </div>
                                        {item.desc && (
                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--adm-text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                                {item.desc}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Row */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        gap: '8px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="adm-btn adm-btn-sm adm-btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id, item.title)}
                                            className="adm-btn adm-btn-sm adm-btn-danger"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ══ Table View ══ */
                    <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Role / Degree</th>
                                    <th>Organization / Place</th>
                                    <th>Type</th>
                                    <th>Visibility</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.map((item) => (
                                    <tr key={item._id}>
                                        <td style={{ fontWeight: '700', color: 'var(--adm-primary)' }}>{item.year}</td>
                                        <td>
                                            <strong style={{ color: 'var(--adm-text-main)' }}>{item.title}</strong>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)', maxWidth: '300px' }}>
                                                {item.desc}
                                            </p>
                                        </td>
                                        <td>{item.place}</td>
                                        <td>
                                            <span style={{
                                                textTransform: 'capitalize',
                                                fontSize: '12px',
                                                background: item.type === 'experience' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: item.type === 'experience' ? '#38bdf8' : '#10b981',
                                                padding: '4px 8px',
                                                borderRadius: '6px'
                                            }}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleVisibility(item._id, item.title)}
                                                className={`adm-status-tag ${item.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                            >
                                                {item.isPublic ? 'Public' : 'Private'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button onClick={() => openEditModal(item)} className="adm-btn adm-btn-sm adm-btn-secondary">
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button onClick={() => handleDelete(item._id, item.title)} className="adm-btn adm-btn-sm adm-btn-danger">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Add/Edit Modal with 1-Click Icon Presets ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal" style={{ maxWidth: '580px', width: '100%' }}>
                        <div className="adm-modal-header">
                            <h3 className="adm-card-title">{editingItem ? 'Edit Timeline Entry' : 'Add New Milestone'}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Milestone Type</label>
                                    <select
                                        className="adm-select"
                                        value={formData.type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            setFormData(p => ({
                                                ...p,
                                                type: nextType,
                                                icon: nextType === 'education' ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-briefcase'
                                            }));
                                        }}
                                    >
                                        <option value="experience">💼 Job / Experience</option>
                                        <option value="education">🎓 Education / Degree</option>
                                    </select>
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Year / Duration</label>
                                    <input
                                        type="text"
                                        required
                                        className="adm-input"
                                        value={formData.year}
                                        onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                                        placeholder="e.g. 2024 or 2022 - 2024"
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Role / Degree Title</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Senior Frontend Developer / Master of Computer Applications"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Organization / Place</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    value={formData.place}
                                    onChange={(e) => setFormData(p => ({ ...p, place: e.target.value }))}
                                    placeholder="e.g. Google India / Haldia Institute of Technology"
                                />
                            </div>

                            {/* 1-Click Icon Presets */}
                            <div className="adm-form-group">
                                <label className="adm-label">Select Milestone Icon</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                    {TIMELINE_ICON_PRESETS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, icon: p.icon }))}
                                            className={`adm-icon-btn ${formData.icon === p.icon ? 'adm-icon-btn--active' : ''}`}
                                        >
                                            <i className={p.icon} />
                                            <span>{p.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'rgba(56, 189, 248, 0.15)',
                                        color: '#38bdf8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0
                                    }}>
                                        <i className={formData.icon || 'fa-solid fa-briefcase'} />
                                    </div>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={formData.icon}
                                        onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="fa-solid fa-briefcase"
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Description / Achievements (Optional)</label>
                                <textarea
                                    rows={3}
                                    className="adm-textarea"
                                    value={formData.desc}
                                    onChange={(e) => setFormData(p => ({ ...p, desc: e.target.value }))}
                                    placeholder="Brief bullet points or description of your role/studies..."
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Visibility</label>
                                <div className="adm-toggle-wrap">
                                    <label className="adm-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPublic}
                                            onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))}
                                        />
                                        <span className="adm-slider"></span>
                                    </label>
                                    <span className="adm-toggle-label">
                                        {formData.isPublic ? 'Public (Visible on Portfolio)' : 'Private (Hidden)'}
                                    </span>
                                </div>
                            </div>

                            <div className="adm-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="adm-btn adm-btn-primary">
                                    {editingItem ? 'Update Milestone' : 'Save Milestone'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
