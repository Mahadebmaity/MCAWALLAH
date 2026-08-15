import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = ['Frontend', 'Backend', 'Language', 'Database', 'Design / Tools', 'Other'];

export default function SkillsCMS() {
    const { authFetch } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Frontend',
        level: 85,
        icon: 'fa-brands fa-react',
        color: '#61DAFB',
        isPublic: true
    });

    const fetchSkills = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/skills');
            if (res.ok) {
                const data = await res.json();
                setSkills(data);
            }
        } catch (err) {
            console.error('Failed to load skills:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const openAddModal = () => {
        setEditingSkill(null);
        setFormData({
            name: '',
            category: 'Frontend',
            level: 85,
            icon: 'fa-brands fa-react',
            color: '#61DAFB',
            isPublic: true
        });
        setModalOpen(true);
    };

    const openEditModal = (skill) => {
        setEditingSkill(skill);
        setFormData({
            name: skill.name,
            category: skill.category || 'Frontend',
            level: skill.level,
            icon: skill.icon,
            color: skill.color,
            isPublic: skill.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = editingSkill
                ? `http://localhost:5000/api/admin/section/skills/${editingSkill._id}`
                : 'http://localhost:5000/api/admin/section/skills';
            const method = editingSkill ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchSkills();
                setToast({
                    type: 'success',
                    title: editingSkill ? 'Skill Updated! ⚡' : 'New Skill Added! 🚀',
                    message: `${formData.name} is now saved with ${formData.level}% mastery.`
                });
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error Saving Skill',
                message: err.message
            });
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name || 'this skill'}"?`)) return;
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/skills/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSkills(prev => prev.filter(s => s._id !== id));
                setToast({
                    type: 'success',
                    title: 'Skill Deleted',
                    message: `${name || 'The skill'} has been removed.`
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

    const toggleVisibility = async (id, name) => {
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/skills/${id}/visibility`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const data = await res.json();
                setSkills(prev => prev.map(s => s._id === id ? { ...s, isPublic: data.item.isPublic } : s));
                setToast({
                    type: 'success',
                    title: data.item.isPublic ? 'Skill Set to Public 🌐' : 'Skill Set to Private 🔒',
                    message: `${name || 'Skill'} is ${data.item.isPublic ? 'now visible to visitors' : 'hidden from public view'}.`
                });
            }
        } catch (err) {
            console.error('Toggle visibility failed:', err);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Skills...</div>;
    }

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <div className="adm-card">
                <div className="adm-card-header">
                    <div>
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-microchip" style={{ color: 'var(--adm-primary)' }}></i>
                            Technical Skills ({skills.length})
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                            Add, reorder, adjust percentage bars, and toggle visibility.
                        </p>
                    </div>
                    <button onClick={openAddModal} className="adm-btn adm-btn-primary">
                        <i className="fa-solid fa-plus"></i> Add New Skill
                    </button>
                </div>

                <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Skill</th>
                                <th>Category</th>
                                <th>Mastery Level</th>
                                <th>Visibility</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skills.map((skill) => (
                                <tr key={skill._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                background: `${skill.color}22`,
                                                border: `1px solid ${skill.color}44`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                color: skill.color
                                            }}>
                                                <i className={skill.icon}></i>
                                            </div>
                                            <strong style={{ color: 'var(--adm-text-main)', fontSize: '14px' }}>{skill.name}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '12px',
                                            background: 'var(--adm-surface-2)',
                                            color: 'var(--adm-text-main)',
                                            border: '1px solid var(--adm-border)',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
                                        }}>
                                            {skill.category}
                                        </span>
                                    </td>
                                    <td style={{ width: '220px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                flex: 1,
                                                height: '8px',
                                                background: 'var(--adm-surface-2)',
                                                border: '1px solid var(--adm-border)',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${skill.level}%`,
                                                    height: '100%',
                                                    background: skill.color
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '600', width: '32px' }}>
                                                {skill.level}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleVisibility(skill._id)}
                                            className={`adm-status-tag ${skill.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                            style={{ cursor: 'pointer', border: 'none' }}
                                        >
                                            <span className="adm-status-dot"></span>
                                            {skill.isPublic ? 'Public' : 'Private'}
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                                            <button
                                                onClick={() => openEditModal(skill)}
                                                className="adm-btn adm-btn-sm adm-btn-secondary"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(skill._id)}
                                                className="adm-btn adm-btn-sm adm-btn-danger"
                                            >
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
                            <h3 className="adm-card-title">
                                {editingSkill ? 'Edit Technical Skill' : 'Add New Technical Skill'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="adm-form-group">
                                <label className="adm-label">Skill Name</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Next.js, PostgreSQL, Docker"
                                />
                            </div>

                            <div className="adm-grid-2">
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

                                <div className="adm-form-group">
                                    <label className="adm-label">FontAwesome Icon Class</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={formData.icon}
                                        onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="fa-brands fa-react"
                                    />
                                </div>
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Mastery Level: {formData.level}%</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        style={{ width: '100%', marginTop: '10px' }}
                                        value={formData.level}
                                        onChange={(e) => setFormData(p => ({ ...p, level: Number(e.target.value) }))}
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Brand / Accent Color</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                            style={{ width: '45px', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            className="adm-input"
                                            value={formData.color}
                                            onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        />
                                    </div>
                                </div>
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
                                        {formData.isPublic ? 'Public (Visible to everyone)' : 'Private (Hidden on portfolio)'}
                                    </span>
                                </div>
                            </div>

                            <div className="adm-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="adm-btn adm-btn-primary">
                                    {editingSkill ? 'Update Skill' : 'Save Skill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
