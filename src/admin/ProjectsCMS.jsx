import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = ['React', 'Full Stack', 'Python', 'UI/UX', 'Mobile', 'Open Source', 'Other'];
const STATUSES = ['Live', 'Open Source', 'In Progress', 'Archived'];

export default function ProjectsCMS() {
    const { authFetch } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        category: 'React',
        tags: 'React, CSS, Vite',
        github: '',
        live: '',
        status: 'Live',
        coverImage: '',
        stars: 0,
        forks: 0,
        color: '#e84545',
        isFeatured: false,
        isPublic: true
    });
    const [message, setMessage] = useState(null);

    const fetchProjects = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (err) {
            console.error('Failed to load projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openAddModal = () => {
        setEditingProject(null);
        setFormData({
            title: '',
            desc: '',
            category: 'React',
            tags: 'React, CSS, Vite',
            github: 'https://github.com',
            live: 'https://yoursite.com',
            status: 'Live',
            coverImage: '',
            stars: 0,
            forks: 0,
            color: '#e84545',
            isFeatured: false,
            isPublic: true
        });
        setModalOpen(true);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            desc: project.desc,
            category: project.category || 'React',
            tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags || '',
            github: project.github || '',
            live: project.live || '',
            status: project.status || 'Live',
            coverImage: project.coverImage || '',
            stars: project.stars || 0,
            forks: project.forks || 0,
            color: project.color || '#e84545',
            isFeatured: project.isFeatured ?? false,
            isPublic: project.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/media/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: data
            });
            const json = await res.json();
            if (res.ok && json.url) {
                setFormData(p => ({ ...p, coverImage: json.url }));
            } else {
                alert(json.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const url = editingProject
                ? `http://localhost:5000/api/admin/section/projects/${editingProject._id}`
                : 'http://localhost:5000/api/admin/section/projects';
            const method = editingProject ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchProjects();
                setToast({
                    type: 'success',
                    title: editingProject ? 'Project Updated! 🚀' : 'New Project Published! 🎉',
                    message: `"${formData.title}" is now saved with category ${formData.category}.`
                });
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error Saving Project',
                message: err.message
            });
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title || 'this project'}"?`)) return;
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/projects/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p._id !== id));
                setToast({
                    type: 'success',
                    title: 'Project Deleted',
                    message: `"${title || 'Project'}" has been removed.`
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
            const res = await authFetch(`http://localhost:5000/api/admin/section/projects/${id}/visibility`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(prev => prev.map(p => p._id === id ? { ...p, isPublic: data.item.isPublic } : p));
                setToast({
                    type: 'success',
                    title: data.item.isPublic ? 'Project Public 🌐' : 'Project Private 🔒',
                    message: `"${title || 'Project'}" is ${data.item.isPublic ? 'now visible to visitors' : 'hidden from public view'}.`
                });
            }
        } catch (err) {
            console.error('Toggle visibility failed:', err);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Projects...</div>;
    }

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <div className="adm-card">
                <div className="adm-card-header">
                    <div>
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-folder-open" style={{ color: 'var(--adm-primary)' }}></i>
                            Project Studio ({projects.length})
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                            Showcase your best builds, upload screenshots, add GitHub / Demo links, and control visibility.
                        </p>
                    </div>
                    <button onClick={openAddModal} className="adm-btn adm-btn-primary">
                        <i className="fa-solid fa-plus"></i> Add New Project
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            style={{
                                background: 'var(--adm-surface-2)',
                                border: '1px solid var(--adm-border)',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: project.color || 'var(--adm-primary)'
                            }} />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        background: `${project.color || '#e84545'}22`,
                                        color: project.color || '#e84545',
                                        padding: '3px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {project.category}
                                    </span>

                                    <button
                                        onClick={() => toggleVisibility(project._id)}
                                        className={`adm-status-tag ${project.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                        style={{ cursor: 'pointer', border: 'none' }}
                                    >
                                        {project.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>

                                {project.coverImage && (
                                    <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: '#000' }}>
                                        <img src={project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--adm-text-main)' }}>{project.title}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 12px', lineHeight: '1.4' }}>
                                    {project.desc}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                    {project.tags?.map((tag, i) => (
                                        <span key={i} style={{ fontSize: '11px', background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--adm-text-muted)' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--adm-border)', paddingTop: '14px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {project.github && (
                                        <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--adm-text-muted)', fontSize: '15px' }}>
                                            <i className="fa-brands fa-github"></i>
                                        </a>
                                    )}
                                    {project.live && (
                                        <a href={project.live} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--adm-primary)', fontSize: '15px' }}>
                                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                        </a>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openEditModal(project)} className="adm-btn adm-btn-sm adm-btn-secondary">
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button onClick={() => handleDelete(project._id)} className="adm-btn adm-btn-sm adm-btn-danger">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal">
                        <div className="adm-modal-header">
                            <h3 className="adm-card-title">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="adm-form-group">
                                <label className="adm-label">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    className="adm-input"
                                    placeholder="e.g. AI-Powered SaaS Platform"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
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
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Project Status</label>
                                    <select
                                        className="adm-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                                    >
                                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Short Description</label>
                                <textarea
                                    rows={3}
                                    required
                                    className="adm-textarea"
                                    placeholder="What does this project do and what problems does it solve?"
                                    value={formData.desc}
                                    onChange={(e) => setFormData(p => ({ ...p, desc: e.target.value }))}
                                ></textarea>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Tech Stack Tags (Comma-separated)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="React, TypeScript, Node.js, Tailwind"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                                />
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">GitHub Repository URL</label>
                                    <input
                                        type="url"
                                        className="adm-input"
                                        placeholder="https://github.com/username/repo"
                                        value={formData.github}
                                        onChange={(e) => setFormData(p => ({ ...p, github: e.target.value }))}
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Live Demo URL</label>
                                    <input
                                        type="url"
                                        className="adm-input"
                                        placeholder="https://demo.app.com"
                                        value={formData.live}
                                        onChange={(e) => setFormData(p => ({ ...p, live: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* ── Image Upload & Preview ── */}
                            <div className="adm-form-group">
                                <label className="adm-label">Project Screenshot / Cover Image</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Image URL or upload via button..."
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData(p => ({ ...p, coverImage: e.target.value }))}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="adm-btn adm-btn-secondary"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {uploading ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin"></i> Uploading...</>
                                        ) : (
                                            <><i className="fa-solid fa-cloud-arrow-up"></i> Upload Photo</>
                                        )}
                                    </button>
                                </div>
                                {formData.coverImage && (
                                    <div style={{ marginTop: '10px', height: '100px', width: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Accent Color</label>
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

                                <div className="adm-form-group">
                                    <label className="adm-label">Visibility</label>
                                    <div className="adm-toggle-wrap" style={{ marginTop: '10px' }}>
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
                            </div>

                            <div className="adm-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                                <button type="submit" className="adm-btn adm-btn-primary">Save Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
