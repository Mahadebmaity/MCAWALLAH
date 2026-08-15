// src/admin/AboutCMS.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function AboutCMS() {
    const { authFetch } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [toast, setToast] = useState(null);

    const [about, setAbout] = useState({
        displayName: 'Mahadeb Maity',
        title: 'Full Stack Developer',
        location: 'Haldia, West Bengal, India',
        avatarUrl: '',
        paragraphs: [
            "I'm a passionate Full Stack Developer based in Haldia, West Bengal, India. I love turning complex problems into elegant, user-friendly solutions. With 3+ years of experience, I specialise in building fast, accessible, and beautiful web applications that people enjoy using.",
            "When I'm not coding, you'll find me exploring open source projects, sipping coffee, or levelling up in my favourite games."
        ],
        quickStats: [
            { icon: 'fa-solid fa-code', val: '3+', label: 'Years Coding' },
            { icon: 'fa-solid fa-folder-open', val: '40+', label: 'Projects Done' },
            { icon: 'fa-solid fa-mug-hot', val: '∞', label: 'Cups of Coffee' }
        ],
        hobbies: [
            { icon: 'fa-solid fa-gamepad', label: 'Gaming' },
            { icon: 'fa-solid fa-book-open', label: 'Reading' },
            { icon: 'fa-solid fa-music', label: 'Music' },
            { icon: 'fa-solid fa-camera', label: 'Photography' },
            { icon: 'fa-solid fa-terminal', label: 'Open Source' },
            { icon: 'fa-solid fa-mug-hot', label: 'Coffee' }
        ],
        resumeUrl: '/resume.pdf',
        resumeLabel: 'Download Resume',
        resumes: [],
        isPublic: true
    });

    const [newParagraph, setNewParagraph] = useState('');
    const [newStat, setNewStat] = useState({ icon: 'fa-solid fa-star', val: '', label: '' });
    const [newHobby, setNewHobby] = useState({ icon: 'fa-solid fa-heart', label: '' });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [newCustomResume, setNewCustomResume] = useState({ title: '', url: '' });

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await authFetch('http://localhost:5000/api/admin/section/about');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setAbout(prev => ({
                            ...prev,
                            ...data,
                            paragraphs: data.paragraphs?.length ? data.paragraphs : prev.paragraphs,
                            quickStats: data.quickStats?.length ? data.quickStats : prev.quickStats,
                            hobbies: data.hobbies?.length ? data.hobbies : prev.hobbies
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to load about data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setSavedSuccess(false);

        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/about', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(about)
            });

            if (res.ok) {
                setSavedSuccess(true);

                // Broadcast live update
                try {
                    const channel = new BroadcastChannel('portfolio_cms_sync');
                    channel.postMessage({ type: 'about_updated', timestamp: Date.now() });
                    channel.close();
                } catch (e) {}
                localStorage.setItem('portfolio_data_updated', Date.now().toString());

                setToast({
                    type: 'success',
                    title: 'About Section Saved! 🌟',
                    message: 'Your personal bio, quick stats, and hobbies are now live on your portfolio.',
                    duration: 5000,
                    action: (
                        <a
                            href="/#about"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#38bdf8',
                                fontSize: '12px',
                                fontWeight: '600',
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square" /> View Live Changes
                        </a>
                    )
                });

                setTimeout(() => setSavedSuccess(false), 4000);
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error Saving Section',
                message: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploadingAvatar(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/user/avatar', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setAbout(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                setToast({
                    type: 'success',
                    title: 'Avatar Uploaded! 📸',
                    message: 'Your profile photo has been updated successfully.'
                });
            } else {
                throw new Error('Avatar upload failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Upload Failed',
                message: err.message
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Paragraph Handlers
    const addParagraph = () => {
        if (!newParagraph.trim()) return;
        setAbout(prev => ({
            ...prev,
            paragraphs: [...(prev.paragraphs || []), newParagraph.trim()]
        }));
        setNewParagraph('');
    };

    const updateParagraph = (index, text) => {
        const updated = [...(about.paragraphs || [])];
        updated[index] = text;
        setAbout(prev => ({ ...prev, paragraphs: updated }));
    };

    const deleteParagraph = (index) => {
        setAbout(prev => ({
            ...prev,
            paragraphs: prev.paragraphs.filter((_, i) => i !== index)
        }));
    };

    // Quick Stats Handlers
    const addQuickStat = () => {
        if (!newStat.val.trim() || !newStat.label.trim()) return;
        setAbout(prev => ({
            ...prev,
            quickStats: [...(prev.quickStats || []), { ...newStat }]
        }));
        setNewStat({ icon: 'fa-solid fa-star', val: '', label: '' });
    };

    const deleteQuickStat = (index) => {
        setAbout(prev => ({
            ...prev,
            quickStats: prev.quickStats.filter((_, i) => i !== index)
        }));
    };

    // Hobby Handlers
    const addHobby = () => {
        if (!newHobby.label.trim()) return;
        setAbout(prev => ({
            ...prev,
            hobbies: [...(prev.hobbies || []), { ...newHobby }]
        }));
        setNewHobby({ icon: 'fa-solid fa-heart', label: '' });
    };

    const deleteHobby = (index) => {
        setAbout(prev => ({
            ...prev,
            hobbies: prev.hobbies.filter((_, i) => i !== index)
        }));
    };

    // Resume Handlers
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingResume(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/media/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                const currentResumes = Array.isArray(about.resumes) ? about.resumes : [];
                const visibleCount = currentResumes.filter(r => r.isVisible !== false).length;
                const shouldBeVisible = visibleCount < 3;

                const newResumeItem = {
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    url: data.url,
                    fileName: file.name,
                    fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF Document',
                    uploadedAt: new Date().toISOString(),
                    isVisible: shouldBeVisible,
                    isDefault: currentResumes.length === 0
                };

                setAbout(prev => {
                    const updatedList = [newResumeItem, ...(prev.resumes || [])];
                    return {
                        ...prev,
                        resumeUrl: prev.resumeUrl && prev.resumeUrl !== '/resume.pdf' ? prev.resumeUrl : data.url,
                        resumes: updatedList
                    };
                });

                setToast({
                    type: 'success',
                    title: 'Resume Added to Vault! 📄',
                    message: `"${file.name}" saved to your permanent catalog${shouldBeVisible ? ' and activated on your portfolio.' : '.'}`
                });
            } else {
                const errData = await res.json();
                throw new Error(errData.message || 'Resume upload failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Resume Upload Failed',
                message: err.message
            });
        } finally {
            setUploadingResume(false);
            e.target.value = '';
        }
    };

    const toggleResumeVisibility = (index) => {
        const currentList = [...(about.resumes || [])];
        const target = currentList[index];
        if (!target) return;

        const currentlyVisibleCount = currentList.filter((r, i) => i !== index && r.isVisible !== false).length;

        if (target.isVisible === false) {
            if (currentlyVisibleCount >= 3) {
                setToast({
                    type: 'warning',
                    title: 'Limit Reached (3 Resumes Max)',
                    message: 'You can display a maximum of 3 resume buttons simultaneously on your portfolio. Please turn off another resume first.'
                });
                return;
            }
            target.isVisible = true;
        } else {
            target.isVisible = false;
        }

        setAbout(prev => ({
            ...prev,
            resumes: currentList
        }));
    };

    const updateResumeTitle = (index, newTitle) => {
        setAbout(prev => {
            const list = [...(prev.resumes || [])];
            if (list[index]) {
                list[index] = { ...list[index], title: newTitle };
            }
            return { ...prev, resumes: list };
        });
    };

    const setAsDefaultResume = (index) => {
        setAbout(prev => {
            const list = (prev.resumes || []).map((r, i) => ({
                ...r,
                isDefault: i === index,
                isVisible: i === index ? true : r.isVisible
            }));
            const selected = list[index];
            return {
                ...prev,
                resumeUrl: selected ? selected.url : prev.resumeUrl,
                resumes: list
            };
        });
        setToast({
            type: 'success',
            title: 'Primary Resume Selected ⭐',
            message: 'Set as your primary resume for instant downloads.'
        });
    };

    const deleteResumeItem = (index) => {
        if (!window.confirm('Are you sure you want to remove this resume from your vault?')) return;
        setAbout(prev => {
            const list = (prev.resumes || []).filter((_, i) => i !== index);
            const activeResume = list.find(r => r.isDefault) || list.find(r => r.isVisible !== false) || list[0];
            return {
                ...prev,
                resumeUrl: activeResume ? activeResume.url : '/resume.pdf',
                resumes: list
            };
        });
    };

    const addCustomResumeUrl = () => {
        if (!newCustomResume.url.trim()) return;
        const currentResumes = Array.isArray(about.resumes) ? about.resumes : [];
        const visibleCount = currentResumes.filter(r => r.isVisible !== false).length;
        const shouldBeVisible = visibleCount < 3;

        const newResumeItem = {
            title: newCustomResume.title.trim() || 'Custom Resume Link',
            url: newCustomResume.url.trim(),
            fileName: 'Cloud / Direct Link',
            uploadedAt: new Date().toISOString(),
            isVisible: shouldBeVisible,
            isDefault: currentResumes.length === 0
        };

        setAbout(prev => {
            const isFirst = currentResumes.length === 0;
            return {
                ...prev,
                resumeUrl: isFirst ? newCustomResume.url.trim() : prev.resumeUrl,
                resumes: [newResumeItem, ...currentResumes]
            };
        });

        setNewCustomResume({ title: '', url: '' });
        setToast({
            type: 'success',
            title: 'Resume Link Added! 🔗',
            message: 'External CV link saved in your vault.'
        });
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading About Studio...</div>;
    }

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <form onSubmit={handleSave}>
                {/* ── Personal Info & Avatar ── */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-circle-user" style={{ color: 'var(--adm-primary)' }}></i>
                                Personal Identity & Bio
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Configure your primary display name, role, location, profile photo, and resume link.
                            </p>
                        </div>
                        <div className="adm-toggle-wrap">
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={about.isPublic}
                                    onChange={(e) => setAbout({ ...about, isPublic: e.target.checked })}
                                />
                                <span className="adm-slider"></span>
                            </label>
                            <span style={{ fontSize: '13px', color: 'var(--adm-text-main)' }}>
                                {about.isPublic ? 'Section Public' : 'Draft Mode'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            border: '2px solid var(--adm-primary)',
                            overflow: 'hidden',
                            background: 'var(--adm-surface-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {about.avatarUrl ? (
                                <img src={about.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className="fa-solid fa-user" style={{ fontSize: '32px', color: 'var(--adm-text-muted)' }}></i>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <label className="adm-label">Profile Avatar Image</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="avatar-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarUpload}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="adm-btn adm-btn-secondary"
                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                    {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                                </label>
                                {about.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setAbout({ ...about, avatarUrl: '' })}
                                        className="adm-btn adm-btn-danger adm-btn-sm"
                                    >
                                        <i className="fa-solid fa-trash"></i> Remove
                                    </button>
                                )}
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                Supported formats: JPG, PNG, WEBP (Max 5MB)
                            </p>
                        </div>
                    </div>

                    <div className="adm-grid-2">
                        <div className="adm-form-group">
                            <label className="adm-label">Display Name</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={about.displayName}
                                onChange={(e) => setAbout({ ...about, displayName: e.target.value })}
                                placeholder="Mahadeb Maity"
                            />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Professional Title</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={about.title}
                                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                                placeholder="Full Stack Developer"
                            />
                        </div>
                    </div>

                    <div className="adm-grid-2">
                        <div className="adm-form-group">
                            <label className="adm-label">Location</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={about.location}
                                onChange={(e) => setAbout({ ...about, location: e.target.value })}
                                placeholder="Haldia, West Bengal, India"
                            />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Resume Button Display Text</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={about.resumeLabel || ''}
                                onChange={(e) => setAbout({ ...about, resumeLabel: e.target.value })}
                                placeholder="Download Resume"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Resume & CV Management Studio Card ── */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-file-pdf" style={{ color: '#e84545' }} />
                                Resume &amp; CV Management Studio
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Upload new resume files (.pdf, .docx), keep multiple versions, or link external cloud files. Visitors can preview or download your active resume.
                            </p>
                        </div>
                    </div>

                    {/* Active Resume Status Banner */}
                    <div style={{
                        background: 'var(--adm-surface-2)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '10px',
                                background: 'rgba(232, 69, 69, 0.15)',
                                color: '#e84545',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '22px'
                            }}>
                                <i className="fa-solid fa-file-pdf" />
                            </div>
                            <div>
                                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    ● Active Portfolio Resume
                                </span>
                                <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                    {about.resumeUrl ? (about.resumeUrl.split('/').pop() || 'Active CV') : 'No resume selected'}
                                </h4>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', fontFamily: 'monospace' }}>
                                    {about.resumeUrl || '/resume.pdf'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {about.resumeUrl && (
                                <>
                                    <a
                                        href={about.resumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="adm-btn adm-btn-secondary adm-btn-sm"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <i className="fa-solid fa-arrow-up-right-from-square" /> Preview Online
                                    </a>
                                    <a
                                        href={about.resumeUrl}
                                        download
                                        className="adm-btn adm-btn-primary adm-btn-sm"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <i className="fa-solid fa-download" /> Test Download
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Upload New Resume or Add External Link */}
                    <div className="adm-grid-2" style={{ marginBottom: '24px' }}>
                        {/* Option 1: Direct File Upload */}
                        <div style={{
                            background: 'var(--adm-surface)',
                            border: '2px dashed var(--adm-border)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '32px', color: 'var(--adm-primary)' }} />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Upload Latest Resume File</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                    Supports PDF, DOC, DOCX files (Up to 10MB)
                                </p>
                            </div>
                            <label className="adm-btn adm-btn-primary" style={{ cursor: uploadingResume ? 'not-allowed' : 'pointer', opacity: uploadingResume ? 0.7 : 1 }}>
                                <i className={`fa-solid ${uploadingResume ? 'fa-spinner fa-spin' : 'fa-upload'}`} />
                                {uploadingResume ? 'Uploading Resume...' : 'Choose File to Upload'}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword"
                                    onChange={handleResumeUpload}
                                    disabled={uploadingResume}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Option 2: Link Google Drive / Dropbox / External PDF */}
                        <div style={{
                            background: 'var(--adm-surface)',
                            border: '1px solid var(--adm-border)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-link" style={{ color: 'var(--adm-primary)' }} />
                                Add Cloud Link (Google Drive / Dropbox)
                            </h4>
                            <div className="adm-form-group" style={{ margin: 0 }}>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="Resume Title (e.g. Full Stack Developer 2026)"
                                    value={newCustomResume.title}
                                    onChange={(e) => setNewCustomResume({ ...newCustomResume, title: e.target.value })}
                                />
                            </div>
                            <div className="adm-form-group" style={{ margin: 0 }}>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="https://drive.google.com/... or direct PDF link"
                                    value={newCustomResume.url}
                                    onChange={(e) => setNewCustomResume({ ...newCustomResume, url: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addCustomResumeUrl}
                                disabled={!newCustomResume.url.trim()}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                                style={{ alignSelf: 'flex-start' }}
                            >
                                <i className="fa-solid fa-plus" /> Save Link to Catalog
                            </button>
                        </div>
                    </div>

                    {/* Catalog of Uploaded Resumes (Vault) */}
                    {(about.resumes?.length > 0) && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                    📂 Permanent Resume Vault &amp; History ({about.resumes.length})
                                </h4>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: (about.resumes.filter(r => r.isVisible !== false).length <= 3) ? '#10b981' : '#f59e0b',
                                    background: 'var(--adm-surface-2)',
                                    padding: '4px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid var(--adm-border)'
                                }}>
                                    Active on Portfolio: {about.resumes.filter(r => r.isVisible !== false).length} / 3 max
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {about.resumes.map((r, idx) => {
                                    const isPrimary = about.resumeUrl === r.url || r.isDefault;
                                    const isVisible = r.isVisible !== false;

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(200px, 1.2fr) minmax(180px, 1fr) auto',
                                                alignItems: 'center',
                                                background: 'var(--adm-surface-2)',
                                                border: `1px solid ${isPrimary ? '#10b981' : (isVisible ? 'var(--adm-primary)' : 'var(--adm-border)')}`,
                                                padding: '14px 18px',
                                                borderRadius: '12px',
                                                gap: '16px',
                                                opacity: isVisible ? 1 : 0.65,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {/* Column 1: Editable Title & File Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '8px',
                                                    background: isPrimary ? 'rgba(16, 185, 129, 0.15)' : 'rgba(232, 69, 69, 0.15)',
                                                    color: isPrimary ? '#10b981' : '#e84545',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '18px',
                                                    flexShrink: 0
                                                }}>
                                                    <i className="fa-solid fa-file-pdf" />
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <input
                                                        type="text"
                                                        className="adm-input"
                                                        style={{ padding: '6px 10px', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}
                                                        value={r.title || ''}
                                                        onChange={(e) => updateResumeTitle(idx, e.target.value)}
                                                        placeholder="Resume Button Label (e.g. Full Stack CV)"
                                                    />
                                                    <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                                                        {r.fileName || 'Document'} • {r.fileSize || 'PDF'} • {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'Saved'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Badges & Visibility Switch */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                {/* Visibility Toggle */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleResumeVisibility(idx)}
                                                    className={`adm-btn adm-btn-sm ${isVisible ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                                                    style={{ fontSize: '11px', padding: '6px 12px' }}
                                                    title={isVisible ? "Click to hide from portfolio" : "Click to show as button on portfolio"}
                                                >
                                                    <i className={`fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                                                    {isVisible ? 'Show on Portfolio' : 'Hidden in Vault'}
                                                </button>

                                                {isPrimary ? (
                                                    <span style={{ fontSize: '11px', background: '#10b98122', color: '#10b981', padding: '4px 10px', borderRadius: '999px', fontWeight: '800', border: '1px solid #10b98144' }}>
                                                        ⭐ PRIMARY
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setAsDefaultResume(idx)}
                                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                                        style={{ fontSize: '11px' }}
                                                        title="Set as primary default resume"
                                                    >
                                                        Set Primary
                                                    </button>
                                                )}
                                            </div>

                                            {/* Column 3: Action Buttons */}
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                                    title="Preview Resume in new tab"
                                                >
                                                    <i className="fa-solid fa-arrow-up-right-from-square" />
                                                </a>
                                                <a
                                                    href={r.url}
                                                    download
                                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                                    title="Test Download"
                                                >
                                                    <i className="fa-solid fa-download" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteResumeItem(idx)}
                                                    className="adm-btn adm-btn-sm adm-btn-danger"
                                                    title="Delete permanently from vault"
                                                >
                                                    <i className="fa-solid fa-trash" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Bio Paragraphs ── */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-paragraph" style={{ color: 'var(--adm-primary)' }}></i>
                                Bio Story Paragraphs ({about.paragraphs?.length || 0})
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Edit your introductory paragraphs. Each block appears as a formatted paragraph on the public site.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                        {about.paragraphs?.map((p, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'flex-start',
                                    background: 'var(--adm-surface-2)',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--adm-border)'
                                }}
                            >
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    background: 'var(--adm-primary)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </span>
                                <textarea
                                    rows={3}
                                    className="adm-textarea"
                                    value={p}
                                    onChange={(e) => updateParagraph(index, e.target.value)}
                                    style={{ flex: 1, margin: 0 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteParagraph(index)}
                                    className="adm-btn adm-btn-danger adm-btn-sm"
                                    style={{ alignSelf: 'flex-start' }}
                                    title="Delete Paragraph"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <textarea
                            rows={2}
                            className="adm-textarea"
                            value={newParagraph}
                            onChange={(e) => setNewParagraph(e.target.value)}
                            placeholder="Type a new bio paragraph to add..."
                            style={{ margin: 0 }}
                        />
                        <button
                            type="button"
                            onClick={addParagraph}
                            className="adm-btn adm-btn-secondary"
                            style={{ flexShrink: 0, height: '42px' }}
                        >
                            <i className="fa-solid fa-plus"></i> Add Block
                        </button>
                    </div>
                </div>

                {/* ── Quick Stats Strip ── */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-bolt" style={{ color: 'var(--adm-primary)' }}></i>
                                Quick Highlight Stats ({about.quickStats?.length || 0})
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Highlight cards displayed beside your bio (e.g. 3+ Years Coding, 40+ Projects Done).
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '14px',
                        marginBottom: '20px'
                    }}>
                        {about.quickStats?.map((stat, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: 'var(--adm-surface-2)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <i className={stat.icon} style={{ fontSize: '20px', color: 'var(--adm-primary)' }}></i>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--adm-text-main)' }}>{stat.val}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>{stat.label}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteQuickStat(idx)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        background: 'var(--adm-surface-2)',
                        padding: '12px',
                        borderRadius: '10px'
                    }}>
                        <input
                            type="text"
                            className="adm-input"
                            style={{ width: '160px' }}
                            value={newStat.icon}
                            onChange={(e) => setNewStat({ ...newStat, icon: e.target.value })}
                            placeholder="fa-solid fa-code"
                        />
                        <input
                            type="text"
                            className="adm-input"
                            style={{ width: '100px' }}
                            value={newStat.val}
                            onChange={(e) => setNewStat({ ...newStat, val: e.target.value })}
                            placeholder="3+"
                        />
                        <input
                            type="text"
                            className="adm-input"
                            style={{ flex: 1, minWidth: '150px' }}
                            value={newStat.label}
                            onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                            placeholder="Years Coding"
                        />
                        <button
                            type="button"
                            onClick={addQuickStat}
                            className="adm-btn adm-btn-secondary"
                        >
                            <i className="fa-solid fa-plus"></i> Add Stat
                        </button>
                    </div>
                </div>

                {/* ── Hobbies & Passions ── */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-heart" style={{ color: 'var(--adm-primary)' }}></i>
                                Hobbies & Interests ({about.hobbies?.length || 0})
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Interactive passion pills displayed at the bottom of the About section.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                        {about.hobbies?.map((hobby, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    background: 'var(--adm-surface-2)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '999px',
                                    color: 'var(--adm-text-main)',
                                    fontSize: '13px'
                                }}
                            >
                                <i className={hobby.icon} style={{ color: 'var(--adm-primary)' }}></i>
                                <span>{hobby.label}</span>
                                <button
                                    type="button"
                                    onClick={() => deleteHobby(idx)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--adm-text-muted)',
                                        cursor: 'pointer',
                                        marginLeft: '4px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        background: 'var(--adm-surface-2)',
                        padding: '12px',
                        borderRadius: '10px'
                    }}>
                        <input
                            type="text"
                            className="adm-input"
                            style={{ width: '180px' }}
                            value={newHobby.icon}
                            onChange={(e) => setNewHobby({ ...newHobby, icon: e.target.value })}
                            placeholder="fa-solid fa-gamepad"
                        />
                        <input
                            type="text"
                            className="adm-input"
                            style={{ flex: 1, minWidth: '150px' }}
                            value={newHobby.label}
                            onChange={(e) => setNewHobby({ ...newHobby, label: e.target.value })}
                            placeholder="e.g. Gaming, Photography"
                        />
                        <button
                            type="button"
                            onClick={addHobby}
                            className="adm-btn adm-btn-secondary"
                        >
                            <i className="fa-solid fa-plus"></i> Add Hobby
                        </button>
                    </div>
                </div>

                {/* ── Save Action Bar ── */}
                <div style={{
                    position: 'sticky',
                    bottom: '20px',
                    zIndex: 10,
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '14px',
                    padding: '16px 24px',
                    boxShadow: 'var(--adm-shadow)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {savedSuccess ? (
                            <span style={{ color: 'var(--adm-success)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-solid fa-circle-check" /> Saved Successfully! All updates live.
                            </span>
                        ) : (
                            <span style={{ color: 'var(--adm-text-muted)', fontSize: '13px' }}>
                                Make your adjustments and click save to broadcast changes.
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`adm-btn adm-btn-primary ${saving ? 'adm-btn-loading' : ''}`}
                        style={{ minWidth: '160px', padding: '12px 24px', fontSize: '14px' }}
                    >
                        {saving ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i> Saving...
                            </>
                        ) : savedSuccess ? (
                            <>
                                <i className="fa-solid fa-check"></i> Saved Successfully! ✓
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-floppy-disk"></i> Save About Section
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
