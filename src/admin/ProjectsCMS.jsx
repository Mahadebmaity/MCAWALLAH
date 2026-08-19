import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getMediaUrl } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = ['React', 'Full Stack', 'Python', 'UI/UX', 'Mobile', 'Open Source', 'Other'];
const STATUSES = ['Live', 'Open Source', 'In Progress', 'Archived'];

function ProjectCoverBanner({ coverImage, title, category, color }) {
    const [imgFailed, setImgFailed] = useState(false);
    const mediaUrl = coverImage ? getMediaUrl(coverImage) : null;

    useEffect(() => {
        setImgFailed(false);
    }, [coverImage]);

    const getCategoryIcon = (cat) => {
        switch ((cat || '').toLowerCase()) {
            case 'react': return 'fa-brands fa-react';
            case 'full stack': return 'fa-solid fa-layer-group';
            case 'python': return 'fa-brands fa-python';
            case 'ui/ux': return 'fa-solid fa-palette';
            case 'mobile': return 'fa-solid fa-mobile-screen-button';
            case 'open source': return 'fa-solid fa-code-branch';
            default: return 'fa-solid fa-laptop-code';
        }
    };

    if (mediaUrl && !imgFailed) {
        return (
            <img
                src={mediaUrl}
                alt=""
                onError={() => setImgFailed(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                }}
            />
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 50%, ${color || '#38bdf8'}25 0%, rgba(10, 15, 29, 0.98) 85%)`,
            position: 'relative'
        }}>
            <i
                className={getCategoryIcon(category)}
                style={{
                    fontSize: '44px',
                    color: color || 'var(--adm-primary)',
                    opacity: 0.85,
                    filter: `drop-shadow(0 0 15px ${color || '#38bdf8'}40)`
                }}
            />
        </div>
    );
}

function ProjectImagePreview({ src, onRemove }) {
    const [hasError, setHasError] = useState(false);
    const mediaUrl = src ? getMediaUrl(src) : '';

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (!src) return null;

    return (
        <div className="adm-project-preview-wrap" style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--adm-border)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 200px' }}>
                <div style={{
                    width: '80px',
                    height: '56px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#0a0f1d',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {!hasError ? (
                        <img
                            src={mediaUrl}
                            alt=""
                            onError={() => setHasError(true)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#f87171',
                            fontSize: '10px',
                            textAlign: 'center',
                            padding: '4px'
                        }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '15px' }} />
                            <span style={{ fontSize: '9px', fontWeight: 600 }}>Not Found</span>
                        </div>
                    )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontSize: '12.5px',
                        fontWeight: '600',
                        color: hasError ? '#f87171' : '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        <i className={`fa-solid ${hasError ? 'fa-triangle-exclamation' : 'fa-circle-check'}`} />
                        {hasError ? 'Image file not accessible' : 'Cover Image Loaded'}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--adm-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px'
                    }}>
                        {hasError ? 'Fallback category icon will be displayed' : src}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="adm-btn"
                style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    color: '#f87171',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    background: 'rgba(248, 113, 113, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    flexShrink: 0
                }}
            >
                <i className="fa-solid fa-trash-can" /> Clear
            </button>
        </div>
    );
}

export default function ProjectsCMS() {
    const { authFetch } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
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
            const res = await authFetch(`${API_BASE}/admin/section/projects`);
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
            const res = await fetch(`${API_BASE}/media/upload`, {
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
                ? `${API_BASE}/admin/section/projects/${editingProject._id}`
                : `${API_BASE}/admin/section/projects`;
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
            const res = await authFetch(`${API_BASE}/admin/section/projects/${id}`, {
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
            const res = await authFetch(`${API_BASE}/admin/section/projects/${id}/visibility`, {
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

    const filteredProjects = projects.filter(p => {
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = !query || 
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.desc && p.desc.toLowerCase().includes(query)) ||
            (Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '')).toLowerCase().includes(query);
        return matchesCat && matchesSearch;
    });

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

                {/* ── Quick Stats Metric Counters ── */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{ padding: '5px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-layer-group" /> Total: {projects.length}
                    </span>
                    <span style={{ padding: '5px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-globe" /> Public: {projects.filter(p => p.isPublic).length}
                    </span>
                    <span style={{ padding: '5px 12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-bolt" /> Live Apps: {projects.filter(p => p.status === 'Live').length}
                    </span>
                    <span style={{ padding: '5px 12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-code-branch" /> Open Source: {projects.filter(p => p.status === 'Open Source').length}
                    </span>
                </div>

                {/* ── Search & Filter Toolbar ── */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 240px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', fontSize: '13px' }} />
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="Search projects by title, tag, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>

                    <select
                        className="adm-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: '140px', flex: '0 0 auto' }}
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--adm-border)' }}>
                        <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', color: 'var(--adm-text-muted)', marginBottom: '12px', display: 'block' }} />
                        <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: 'var(--adm-text-main)' }}>No matching projects found</p>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--adm-text-muted)' }}>Try adjusting your search query or category filter.</p>
                    </div>
                ) : (
                    <div className="adm-projects-grid">
                        {filteredProjects.map((project) => {
                        const getCategoryIcon = (cat) => {
                            switch ((cat || '').toLowerCase()) {
                                case 'react': return 'fa-brands fa-react';
                                case 'full stack': return 'fa-solid fa-layer-group';
                                case 'python': return 'fa-brands fa-python';
                                case 'ui/ux': return 'fa-solid fa-palette';
                                case 'mobile': return 'fa-solid fa-mobile-screen-button';
                                case 'open source': return 'fa-solid fa-code-branch';
                                default: return 'fa-solid fa-laptop-code';
                            }
                        };

                        const projectTags = Array.isArray(project.tags) 
                            ? project.tags 
                            : (project.tags ? project.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

                        return (
                            <div
                                key={project._id}
                                style={{
                                    background: 'var(--adm-surface-2)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* Top Color Accent Stripe */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: project.color || 'var(--adm-primary)',
                                    zIndex: 3
                                }} />

                                {/* ── Uniform 140px Top Media Banner ── */}
                                <div style={{
                                    height: '140px',
                                    width: '100%',
                                    position: 'relative',
                                    background: '#0a0f1d',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <ProjectCoverBanner
                                        coverImage={project.coverImage}
                                        title={project.title}
                                        category={project.category}
                                        color={project.color}
                                    />

                                    {/* Gradient overlay on banner */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, rgba(15,23,42,0.85) 100%)',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }} />

                                    {/* Category Pill Overlay */}
                                    <span style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '12px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        backdropFilter: 'blur(6px)',
                                        border: `1px solid ${project.color || 'var(--adm-primary)'}55`,
                                        color: project.color || '#38bdf8',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        zIndex: 2
                                    }}>
                                        {project.category}
                                    </span>

                                    {/* Public / Private Toggle Pill Overlay */}
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility(project._id, project.title)}
                                        className={`adm-status-tag ${project.isPublic ? 'adm-status-tag--public' : 'adm-status-tag--private'}`}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '12px',
                                            cursor: 'pointer',
                                            border: 'none',
                                            zIndex: 2,
                                            padding: '3px 9px',
                                            fontSize: '10px'
                                        }}
                                        title="Toggle Visibility"
                                    >
                                        {project.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>

                                {/* ── Card Content Body ── */}
                                <div style={{
                                    padding: '16px 18px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1
                                }}>
                                    {/* Clamped 2-line Title */}
                                    <h4
                                        style={{
                                            margin: '0 0 6px',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: 'var(--adm-text-main)',
                                            lineHeight: '1.35',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: '40px'
                                        }}
                                        title={project.title}
                                    >
                                        {project.title}
                                    </h4>

                                    {/* Clamped 3-line Description */}
                                    <p
                                        style={{
                                            fontSize: '12.5px',
                                            color: 'var(--adm-text-muted)',
                                            margin: '0 0 12px',
                                            lineHeight: '1.45',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: '54px'
                                        }}
                                        title={project.desc}
                                    >
                                        {project.desc || 'No description provided.'}
                                    </p>

                                    {/* Tags Row */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '5px',
                                        marginBottom: '14px',
                                        maxHeight: '26px',
                                        overflow: 'hidden'
                                    }}>
                                        {projectTags.slice(0, 4).map((tag, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: '10.5px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--adm-border)',
                                                    padding: '2px 7px',
                                                    borderRadius: '4px',
                                                    color: 'var(--adm-text-muted)',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {projectTags.length > 4 && (
                                            <span style={{ fontSize: '10px', color: 'var(--adm-text-muted)', padding: '2px 4px' }}>
                                                +{projectTags.length - 4}
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderTop: '1px solid var(--adm-border)',
                                        paddingTop: '12px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {project.github && (
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--adm-text-muted)', fontSize: '14px', padding: '4px 6px' }}
                                                    title="GitHub Repository"
                                                >
                                                    <i className="fa-brands fa-github"></i>
                                                </a>
                                            )}
                                            {project.live && (
                                                <a
                                                    href={project.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--adm-primary)', fontSize: '14px', padding: '4px 6px' }}
                                                    title="Live Website / Demo"
                                                >
                                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                                </a>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(project)}
                                                className="adm-btn adm-btn-sm adm-btn-secondary"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(project._id, project.title)}
                                                className="adm-btn adm-btn-sm adm-btn-danger"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

            {/* ── Add/Edit Modal ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal">
                        <div className="adm-modal-header">
                            <h3 className="adm-card-title">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="adm-modal-close">
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
                                <div className="adm-project-upload-row">
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Paste image URL (Google Drive, Cloudinary, Imgur, etc.) or upload..."
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
                                    <ProjectImagePreview
                                        src={formData.coverImage}
                                        onRemove={() => setFormData(p => ({ ...p, coverImage: '' }))}
                                    />
                                )}
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">
                                        <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '6px' }} />
                                        GitHub Stars
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="adm-input"
                                        value={formData.stars}
                                        onChange={(e) => setFormData(p => ({ ...p, stars: parseInt(e.target.value) || 0 }))}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">
                                        <i className="fa-solid fa-code-fork" style={{ color: '#38bdf8', marginRight: '6px' }} />
                                        GitHub Forks
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="adm-input"
                                        value={formData.forks}
                                        onChange={(e) => setFormData(p => ({ ...p, forks: parseInt(e.target.value) || 0 }))}
                                        placeholder="0"
                                    />
                                </div>
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
                                    <label className="adm-label">Visibility & Showcase</label>
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
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

                                        <div className="adm-toggle-wrap">
                                            <label className="adm-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isFeatured}
                                                    onChange={(e) => setFormData(p => ({ ...p, isFeatured: e.target.checked }))}
                                                />
                                                <span className="adm-slider"></span>
                                            </label>
                                            <span style={{ fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                                {formData.isFeatured ? '🌟 Featured' : 'Normal'}
                                            </span>
                                        </div>
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
