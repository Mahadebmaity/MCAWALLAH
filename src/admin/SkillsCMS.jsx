import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = ['Frontend', 'Backend', 'Language', 'Database', 'Design / Tools', 'Other'];

const TECH_SKILL_ICONS = [
    { icon: 'fa-brands fa-react', name: 'React', color: '#61DAFB', category: 'Frontend' },
    { icon: 'fa-brands fa-js', name: 'JavaScript', color: '#F7DF1E', category: 'Language' },
    { icon: 'fa-brands fa-node-js', name: 'Node.js', color: '#68A063', category: 'Backend' },
    { icon: 'fa-brands fa-python', name: 'Python', color: '#3776AB', category: 'Language' },
    { icon: 'fa-solid fa-code', name: 'TypeScript', color: '#3178C6', category: 'Language' },
    { icon: 'fa-brands fa-html5', name: 'HTML5', color: '#E34F26', category: 'Frontend' },
    { icon: 'fa-brands fa-css3-alt', name: 'CSS3 / Sass', color: '#264DE4', category: 'Frontend' },
    { icon: 'fa-brands fa-git-alt', name: 'Git & GitHub', color: '#F05032', category: 'Design / Tools' },
    { icon: 'fa-brands fa-docker', name: 'Docker', color: '#2496ED', category: 'Design / Tools' },
    { icon: 'fa-solid fa-database', name: 'MongoDB / SQL', color: '#47A248', category: 'Database' },
    { icon: 'fa-brands fa-vuejs', name: 'Vue.js', color: '#4FC08D', category: 'Frontend' },
    { icon: 'fa-brands fa-angular', name: 'Angular', color: '#DD0031', category: 'Frontend' },
    { icon: 'fa-brands fa-java', name: 'Java', color: '#ED8B00', category: 'Language' },
    { icon: 'fa-brands fa-php', name: 'PHP', color: '#777BB4', category: 'Backend' },
    { icon: 'fa-brands fa-aws', name: 'AWS Cloud', color: '#FF9900', category: 'Design / Tools' },
    { icon: 'fa-brands fa-figma', name: 'Figma UI/UX', color: '#F24E1E', category: 'Design / Tools' },
    { icon: 'fa-brands fa-linux', name: 'Linux', color: '#FCC624', category: 'Design / Tools' },
    { icon: 'fa-solid fa-server', name: 'REST API', color: '#38bdf8', category: 'Backend' },
    { icon: 'fa-solid fa-laptop-code', name: 'Next.js', color: '#38bdf8', category: 'Frontend' },
    { icon: 'fa-brands fa-rust', name: 'Rust', color: '#CE412B', category: 'Language' }
];

export default function SkillsCMS() {
    const { authFetch } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [toast, setToast] = useState(null);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

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
            const res = await authFetch(`${API_BASE}/admin/section/skills`);
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
            color: skill.color || '#38bdf8',
            isPublic: skill.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleSelectIconPreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            icon: preset.icon,
            color: preset.color,
            category: preset.category || prev.category,
            name: prev.name ? prev.name : preset.name
        }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            const url = editingSkill
                ? `${API_BASE}/admin/section/skills/${editingSkill._id}`
                : `${API_BASE}/admin/section/skills`;
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
            const res = await authFetch(`${API_BASE}/admin/section/skills/${id}`, {
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
            const res = await authFetch(`${API_BASE}/admin/section/skills/${id}/visibility`, {
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

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* View Mode Toggle */}
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
                                <i className="fa-solid fa-grip" /> Grid Cards
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
                            <i className="fa-solid fa-plus"></i> Add New Skill
                        </button>
                    </div>
                </div>

                {/* ══ Grid Cards View ══ */}
                {viewMode === 'cards' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '14px'
                    }}>
                        {skills.map((skill) => (
                            <div
                                key={skill._id}
                                style={{
                                    background: 'var(--adm-surface-2)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '10px',
                                            background: `${skill.color || '#38bdf8'}22`,
                                            border: `1px solid ${skill.color || '#38bdf8'}55`,
                                            color: skill.color || '#38bdf8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            flexShrink: 0,
                                            boxShadow: `0 0 14px ${skill.color || '#38bdf8'}22`
                                        }}>
                                            <i className={skill.icon}></i>
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '15px', color: 'var(--adm-text-main)', display: 'block' }}>
                                                {skill.name}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {skill.category}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleVisibility(skill._id, skill.name)}
                                        className={`adm-status-tag ${skill.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                        style={{ cursor: 'pointer', border: 'none', fontSize: '10px', padding: '3px 8px' }}
                                    >
                                        {skill.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                                        <span>Mastery</span>
                                        <span>{skill.level}%</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '7px',
                                        background: 'rgba(255,255,255,0.06)',
                                        borderRadius: '999px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${skill.level}%`,
                                            height: '100%',
                                            background: skill.color || '#38bdf8',
                                            borderRadius: '999px',
                                            boxShadow: `0 0 8px ${skill.color || '#38bdf8'}`
                                        }} />
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button
                                        onClick={() => openEditModal(skill)}
                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                        style={{ fontSize: '11px', padding: '4px 10px' }}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(skill._id, skill.name)}
                                        className="adm-btn adm-btn-sm adm-btn-danger"
                                        style={{ fontSize: '11px', padding: '4px 10px' }}
                                    >
                                        <i className="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ══ Table View ══ */
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
                                                onClick={() => toggleVisibility(skill._id, skill.name)}
                                                className={`adm-status-tag ${skill.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                            >
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
                                                    onClick={() => handleDelete(skill._id, skill.name)}
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
                )}
            </div>

            {/* ── Add/Edit Modal with 1-Click Tech Stack Icon Picker ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal" style={{ maxWidth: '600px', width: '100%' }}>
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
                            {/* 1-Click Tech Stack Icon Picker Grid */}
                            <div className="adm-form-group">
                                <label className="adm-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-icons" style={{ color: 'var(--adm-primary)' }} />
                                    Click to Pick Popular Tech Icon:
                                </label>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '7px',
                                    maxHeight: '140px',
                                    overflowY: 'auto',
                                    background: 'var(--adm-surface-2)',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--adm-border)',
                                    marginBottom: '10px'
                                }}>
                                    {TECH_SKILL_ICONS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectIconPreset(p)}
                                            className={`adm-icon-btn ${formData.icon === p.icon ? 'adm-icon-btn--active' : ''}`}
                                            style={{
                                                borderColor: formData.icon === p.icon ? p.color : undefined,
                                                color: formData.icon === p.icon ? p.color : undefined
                                            }}
                                        >
                                            <i className={p.icon} style={{ color: p.color }} />
                                            <span>{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '8px',
                                            background: `${formData.color || '#38bdf8'}22`,
                                            border: `1px solid ${formData.color || '#38bdf8'}55`,
                                            color: formData.color || '#38bdf8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            flexShrink: 0
                                        }}>
                                            <i className={formData.icon || 'fa-solid fa-code'} />
                                        </div>
                                        <input
                                            type="text"
                                            className="adm-input"
                                            value={formData.icon}
                                            onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                                            placeholder="fa-brands fa-react"
                                        />
                                    </div>
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
                                    <span className="adm-toggle-label">
                                        {formData.isPublic ? 'Public (Visible on portfolio)' : 'Private (Hidden)'}
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
