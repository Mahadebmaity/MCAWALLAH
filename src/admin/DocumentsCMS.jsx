// src/admin/DocumentsCMS.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

const CATEGORIES = ['All', 'System Documentation', 'Certificates', 'Project Reports', 'Architecture', 'Notes', 'Other'];

export default function DocumentsCMS() {
    const { authFetch } = useAuth();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    const [form, setForm] = useState({
        title: '',
        category: 'Project Reports',
        description: '',
        tags: '',
        file: null
    });
    const fileInputRef = useRef(null);

    const fetchDocuments = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/documents');
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (err) {
            console.error('Failed to load documents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(p => ({
                ...p,
                file,
                title: p.title ? p.title : file.name.replace(/\.[^/.]+$/, "")
            }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setToast({ type: 'error', title: 'Title Required', message: 'Please provide a title for the document.' });
            return;
        }
        if (!form.file) {
            setToast({ type: 'error', title: 'File Required', message: 'Please select a document file to upload.' });
            return;
        }

        setUploading(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('document', form.file);

            const uploadRes = await authFetch('http://localhost:5000/api/admin/upload/document', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || 'File upload failed');

            // 2. Save Document Record
            const docPayload = {
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
                fileUrl: uploadData.url,
                fileName: uploadData.fileName,
                fileSize: uploadData.fileSize,
                fileType: uploadData.fileType,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const saveRes = await authFetch('http://localhost:5000/api/admin/section/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docPayload)
            });

            if (saveRes.ok) {
                setToast({
                    type: 'success',
                    title: 'Document Uploaded! 📁',
                    message: `"${form.title}" stored safely in your Document Vault.`,
                    duration: 4000
                });
                setShowUploadModal(false);
                setForm({ title: '', category: 'Project Reports', description: '', tags: '', file: null });
                fetchDocuments();
            } else {
                throw new Error('Failed to save document record');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Upload Failed', message: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/documents/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Document Deleted 🗑️',
                    message: `"${title}" has been removed from your vault.`
                });
                fetchDocuments();
            } else {
                throw new Error('Delete failed');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Delete Error', message: err.message });
        }
    };

    const filteredDocs = docs.filter(d => {
        const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
        const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (d.tags && d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCat && matchesSearch;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Document Vault...</div>;

    return (
        <div>
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════════
                 SPOTLIGHT: OFFICIAL SYSTEM ARCHITECTURE DOCUMENTATION
            ══════════════════════════════════════════════════════════════ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
                marginBottom: '28px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38bdf8',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            marginBottom: '10px'
                        }}>
                            <i className="fa-solid fa-file-shield" /> Official System Architecture Doc
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0' }}>
                            MCA WALLAH Portfolio &amp; CMS Engine Documentation
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '650px', lineHeight: '1.5' }}>
                            Complete technical specifications covering React 19 client architecture, RESTful endpoints, Mongoose data models, Minimax AI arcade, and production deployment guide.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <a
                            href="/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="adm-btn adm-btn-secondary"
                            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', textDecoration: 'none' }}
                        >
                            <i className="fa-solid fa-eye" /> View PDF
                        </a>

                        <a
                            href="/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf"
                            download="MCA_WALLAH_Portfolio_Documentation.pdf"
                            className="adm-btn adm-btn-primary"
                            style={{ textDecoration: 'none' }}
                        >
                            <i className="fa-solid fa-download" /> Download PDF (1.60 MB)
                        </a>

                        <a
                            href="/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.html"
                            target="_blank"
                            rel="noreferrer"
                            className="adm-btn adm-btn-secondary"
                            style={{ textDecoration: 'none' }}
                        >
                            <i className="fa-solid fa-globe" /> HTML Doc
                        </a>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {['React 19', 'Express 4', 'MongoDB', 'Minimax AI', 'Permanent Resume Vault', 'Vercel Ready'].map(tag => (
                        <span key={tag} style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '3px 9px', borderRadius: '6px' }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 DOCUMENT VAULT CONTROLS & FILTERING
            ══════════════════════════════════════════════════════════════ */}
            <div className="adm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div>
                        <h3 className="adm-card-title" style={{ margin: 0 }}>
                            <i className="fa-solid fa-folder-open" style={{ color: 'var(--adm-primary)' }} />
                            Permanent Documents &amp; Files Vault ({filteredDocs.length})
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '4px 0 0 0' }}>
                            Store, organize, preview, and download project reports, architecture specs, certificates, and technical PDFs.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="adm-btn adm-btn-primary"
                    >
                        <i className="fa-solid fa-plus" /> Upload New Document
                    </button>
                </div>

                {/* Search & Category Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    background: selectedCategory === cat ? 'var(--adm-primary)' : 'var(--adm-surface)',
                                    color: selectedCategory === cat ? '#ffffff' : 'var(--adm-text-muted)',
                                    border: `1px solid ${selectedCategory === cat ? 'var(--adm-primary)' : 'var(--adm-border)'}`,
                                    padding: '5px 12px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ minWidth: '240px' }}>
                        <input
                            type="text"
                            className="adm-input"
                            placeholder="🔍 Search documents, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ margin: 0, padding: '7px 12px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* Documents Grid */}
                {filteredDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--adm-surface)', borderRadius: '10px', border: '1px dashed var(--adm-border)' }}>
                        <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', color: 'var(--adm-text-muted)', marginBottom: '10px' }} />
                        <p style={{ margin: 0, color: 'var(--adm-text-muted)', fontSize: '13px' }}>No documents found matching the filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {filteredDocs.map(doc => (
                            <div
                                key={doc._id}
                                style={{
                                    background: 'var(--adm-surface)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: doc.fileType === 'PDF' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                            color: doc.fileType === 'PDF' ? '#ef4444' : '#38bdf8'
                                        }}>
                                            {doc.fileType || 'FILE'}
                                        </span>

                                        <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                                            {doc.fileSize || 'N/A'}
                                        </span>
                                    </div>

                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: 'var(--adm-text-main)', lineHeight: '1.3' }}>
                                        {doc.title}
                                    </h4>

                                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                                        {doc.description || 'No description provided.'}
                                    </p>

                                    {doc.tags && doc.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                            {doc.tags.map((t, idx) => (
                                                <span key={idx} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--adm-text-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--adm-border)', paddingTop: '12px', marginTop: '10px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                                        {doc.category}
                                    </span>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="adm-btn adm-btn-secondary"
                                            style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                                            title="View / Open File"
                                        >
                                            <i className="fa-solid fa-arrow-up-right-from-square" />
                                        </a>

                                        <a
                                            href={doc.fileUrl}
                                            download={doc.fileName || doc.title}
                                            className="adm-btn adm-btn-primary"
                                            style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                                            title="Download Document"
                                        >
                                            <i className="fa-solid fa-download" />
                                        </a>

                                        {!doc.isBuiltin && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(doc._id, doc.title)}
                                                className="adm-btn adm-btn-danger"
                                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                                title="Delete Document"
                                            >
                                                <i className="fa-solid fa-trash" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 UPLOAD DOCUMENT MODAL
            ══════════════════════════════════════════════════════════════ */}
            {showUploadModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--adm-card-bg, #111827)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '16px',
                        maxWidth: '520px',
                        width: '100%',
                        padding: '24px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                                <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--adm-primary)', marginRight: '8px' }} />
                                Upload Document to Vault
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', fontSize: '16px', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="adm-form-group">
                                <label className="adm-label">Document Title</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="e.g. System Architecture Whitepaper / React Certification"
                                    value={form.title}
                                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Category</label>
                                    <select
                                        className="adm-input"
                                        value={form.category}
                                        onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                                    >
                                        <option value="System Documentation">System Documentation</option>
                                        <option value="Certificates">Certificates</option>
                                        <option value="Project Reports">Project Reports</option>
                                        <option value="Architecture">Architecture</option>
                                        <option value="Notes">Notes</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="adm-form-group">
                                    <label className="adm-label">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="API, React, Design"
                                        value={form.tags}
                                        onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Description (Optional)</label>
                                <textarea
                                    rows={2}
                                    className="adm-textarea"
                                    placeholder="Short summary of what this document contains..."
                                    value={form.description}
                                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Select File (PDF, DOCX, TXT, ZIP, Images)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="adm-input"
                                    onChange={handleFileSelect}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="adm-btn adm-btn-secondary"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="adm-btn adm-btn-primary"
                                >
                                    {uploading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin" /> Uploading...</>
                                    ) : (
                                        <><i className="fa-solid fa-upload" /> Save to Vault</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
