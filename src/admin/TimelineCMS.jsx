import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function TimelineCMS() {
    const { authFetch } = useAuth();
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [toast, setToast] = useState(null);
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
            const res = await authFetch('http://localhost:5000/api/admin/section/timeline');
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
            icon: item.icon,
            isPublic: item.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `http://localhost:5000/api/admin/section/timeline/${editingItem._id}`
                : 'http://localhost:5000/api/admin/section/timeline';
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
            const res = await authFetch(`http://localhost:5000/api/admin/section/timeline/${id}`, {
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
            const res = await authFetch(`http://localhost:5000/api/admin/section/timeline/${id}/visibility`, {
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
                    <button onClick={openAddModal} className="adm-btn adm-btn-primary">
                        <i className="fa-solid fa-plus"></i> Add Entry
                    </button>
                </div>

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
                                            onClick={() => toggleVisibility(item._id)}
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
                                            <button onClick={() => handleDelete(item._id)} className="adm-btn adm-btn-sm adm-btn-danger">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal">
                        <div className="adm-modal-header">
                            <h3 className="adm-card-title">{editingItem ? 'Edit Timeline Entry' : 'Add New Milestone'}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Type</label>
                                    <select
                                        className="adm-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                                    >
                                        <option value="experience">Job / Experience</option>
                                        <option value="education">Degree / Education</option>
                                        <option value="achievement">Achievement / Award</option>
                                    </select>
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">Year / Duration</label>
                                    <input
                                        type="text"
                                        required
                                        className="adm-input"
                                        placeholder="e.g. 2024 or 2022 - 2024"
                                        value={formData.year}
                                        onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Role / Degree Title</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    placeholder="e.g. Senior Frontend Developer or B.Tech CSE"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Organization / College / Location</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    placeholder="e.g. Google / Tech Startup / University, West Bengal"
                                    value={formData.place}
                                    onChange={(e) => setFormData(p => ({ ...p, place: e.target.value }))}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Description / Responsibilities</label>
                                <textarea
                                    rows={3}
                                    className="adm-textarea"
                                    placeholder="Brief summary of duties, impact, or achievements..."
                                    value={formData.desc}
                                    onChange={(e) => setFormData(p => ({ ...p, desc: e.target.value }))}
                                ></textarea>
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
                                    <span style={{ fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                        {formData.isPublic ? 'Public' : 'Private'}
                                    </span>
                                </div>
                            </div>

                            <div className="adm-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                                <button type="submit" className="adm-btn adm-btn-primary">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
