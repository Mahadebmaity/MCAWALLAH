import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getDocUrl } from '../config/api';
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
    const [copiedDocId, setCopiedDocId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
            const res = await authFetch(`${API_BASE}/admin/section/documents`);
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

    // Listen for Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setPreviewDoc(null);
                setShowUploadModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

            const uploadRes = await authFetch(`${API_BASE}/admin/upload/document`, {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || 'File upload failed');

            const resolvedFileUrl = uploadData.fileUrl || uploadData.url || uploadData.secure_url || '';
            if (!resolvedFileUrl) {
                throw new Error('Upload succeeded but server did not return a file URL.');
            }

            // 2. Save Document Record
            const docPayload = {
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
                fileUrl: resolvedFileUrl,
                fileName: uploadData.fileName || form.file.name,
                fileSize: uploadData.fileSize || `${(form.file.size / (1024 * 1024)).toFixed(2)} MB`,
                fileType: uploadData.fileType || (form.file.type.includes('pdf') ? 'PDF' : form.file.name.split('.').pop().toUpperCase()),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const saveRes = await authFetch(`${API_BASE}/admin/section/documents`, {
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
            const res = await authFetch(`${API_BASE}/admin/section/documents/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Document Deleted 🗑️',
                    message: `"${title}" has been removed from your vault.`
                });
                if (previewDoc?._id === id) setPreviewDoc(null);
                fetchDocuments();
            } else {
                throw new Error('Delete failed');
            }
        } catch (err) {
            setToast({ type: 'error', title: 'Delete Error', message: err.message });
        }
    };

    const handleCopyUrl = (doc) => {
        const resolvedUrl = getDocUrl(doc);
        if (!resolvedUrl || resolvedUrl === '#') {
            setToast({ type: 'error', title: 'No Link Available', message: 'This document does not have a valid URL.' });
            return;
        }
        const fullUrl = resolvedUrl.startsWith('http') ? resolvedUrl : `${window.location.origin}${resolvedUrl}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopiedDocId(doc._id || 'spotlight');
            setToast({
                type: 'success',
                title: 'Link Copied! 📋',
                message: 'Direct document URL copied to clipboard.'
            });
            setTimeout(() => setCopiedDocId(null), 2500);
        }).catch(() => {
            setToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy URL to clipboard.' });
        });
    };

    const isImageDoc = (doc) => {
        if (!doc) return false;
        const type = (doc.fileType || '').toUpperCase();
        const url = (doc.fileUrl || doc.url || '').toLowerCase();
        const name = (doc.fileName || doc.title || '').toLowerCase();
        return (
            type === 'JPEG' || type === 'JPG' || type === 'PNG' || type === 'WEBP' || type === 'GIF' || type === 'SVG' || type.includes('IMAGE') ||
            /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)
        );
    };

    const isPdfDoc = (doc) => {
        if (!doc) return false;
        const type = (doc.fileType || '').toUpperCase();
        const url = (doc.fileUrl || doc.url || '').toLowerCase();
        const name = (doc.fileName || doc.title || '').toLowerCase();
        return type === 'PDF' || url.endsWith('.pdf') || name.endsWith('.pdf');
    };

    const isHtmlDoc = (doc) => {
        if (!doc) return false;
        const url = (doc.fileUrl || doc.url || '').toLowerCase();
        const name = (doc.fileName || doc.title || '').toLowerCase();
        return url.endsWith('.html') || name.endsWith('.html');
    };

    const filteredDocs = docs.filter(d => {
        const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
        const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (d.tags && d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCat && matchesSearch;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--adm-text-muted)' }}><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px', marginRight: '8px' }} /> Loading Document Vault...</div>;

    return (
        <div>
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════════
                 SPOTLIGHT: OFFICIAL SYSTEM ARCHITECTURE & 28-SECTION DOCUMENTATION
            ══════════════════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                {/* 28-Section Enterprise Doc */}
                <div className="adm-card" style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(24, 24, 72, 0.96) 100%)',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    margin: 0
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(56, 189, 248, 0.18)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                padding: '4px 12px',
                                borderRadius: '999px'
                            }}>
                                <i className="fa-solid fa-graduation-cap" /> 28-Section Specification
                            </span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>1.65 MB • PDF</span>
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0', lineHeight: '1.3' }}>
                            MCA WALLAH 28-Section Enterprise Documentation
                        </h2>
                        <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                            Complete 28-section software engineering specification with Mermaid architecture diagrams, database ER schemas, API matrices, security breakdown &amp; submission report.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setPreviewDoc({
                                title: 'MCA WALLAH Portfolio - 28-Section Comprehensive Enterprise Technical Documentation',
                                category: 'System Documentation',
                                description: 'Complete 28-section industry-standard software project specification & technical report with Mermaid diagrams, API contracts, security matrices, and setup guides.',
                                fileUrl: '/docs/PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf',
                                fileName: 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf',
                                fileSize: '1.65 MB',
                                fileType: 'PDF'
                            })}
                            className="adm-doc-btn-tab"
                            style={{ flex: '1 1 120px' }}
                        >
                            <i className="fa-solid fa-eye" /> Preview PDF
                        </button>

                        <a
                            href={getDocUrl('/docs/PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf')}
                            download="MCA_WALLAH_28_Section_Documentation.pdf"
                            className="adm-doc-btn-download"
                            style={{ flex: '1 1 120px' }}
                        >
                            <i className="fa-solid fa-download" /> Download PDF
                        </a>

                        <button
                            type="button"
                            onClick={() => setPreviewDoc({
                                title: 'MCA WALLAH 28-Section Documentation (HTML View)',
                                category: 'System Documentation',
                                description: 'Interactive web view of the complete 28-section technical specification.',
                                fileUrl: '/docs/PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.html',
                                fileName: 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.html',
                                fileSize: '42 KB',
                                fileType: 'HTML'
                            })}
                            className="adm-doc-btn-copy"
                            style={{ flex: '1 1 100px' }}
                        >
                            <i className="fa-solid fa-globe" /> HTML Doc
                        </button>
                    </div>
                </div>

                {/* Original System Architecture Doc */}
                <div className="adm-card" style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%)',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    margin: 0
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(99, 102, 241, 0.18)',
                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                color: '#a5b4fc',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                padding: '4px 12px',
                                borderRadius: '999px'
                            }}>
                                <i className="fa-solid fa-file-shield" /> System Architecture Blueprint
                            </span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>1.60 MB • PDF</span>
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0', lineHeight: '1.3' }}>
                            Official Architecture &amp; System Documentation
                        </h2>
                        <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                            Core architectural whitepaper covering React 19 client components, REST endpoints, Mongoose schema models, and production deployment guide.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setPreviewDoc({
                                title: 'MCA WALLAH Portfolio - Official System Architecture & Documentation',
                                category: 'System Documentation',
                                description: 'Complete technical blueprint covering React 19 architecture, RESTful API endpoints, MongoDB schemas, and CMS workflows.',
                                fileUrl: '/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf',
                                fileName: 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf',
                                fileSize: '1.60 MB',
                                fileType: 'PDF'
                            })}
                            className="adm-doc-btn-tab"
                            style={{ flex: '1 1 120px' }}
                        >
                            <i className="fa-solid fa-eye" /> Preview PDF
                        </button>

                        <a
                            href={getDocUrl('/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf')}
                            download="MCA_WALLAH_Portfolio_Documentation.pdf"
                            className="adm-doc-btn-download"
                            style={{ flex: '1 1 120px' }}
                        >
                            <i className="fa-solid fa-download" /> Download PDF
                        </a>

                        <button
                            type="button"
                            onClick={() => setPreviewDoc({
                                title: 'MCA WALLAH Architecture Documentation (HTML)',
                                category: 'System Documentation',
                                description: 'Interactive web view of system architecture and API documentation.',
                                fileUrl: '/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.html',
                                fileName: 'PORTFOLIO_SYSTEM_DOCUMENTATION.html',
                                fileSize: '37 KB',
                                fileType: 'HTML'
                            })}
                            className="adm-doc-btn-copy"
                            style={{ flex: '1 1 100px' }}
                        >
                            <i className="fa-solid fa-globe" /> HTML Doc
                        </button>
                    </div>
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
                        {filteredDocs.map(doc => {
                            const isImg = isImageDoc(doc);
                            const isPdf = isPdfDoc(doc);
                            const docUrl = getDocUrl(doc);
                            const hasValidUrl = docUrl && docUrl !== '#';

                            return (
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
                                                background: isPdf ? 'rgba(239, 68, 68, 0.15)' : isImg ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                                color: isPdf ? '#ef4444' : isImg ? '#38bdf8' : '#c084fc'
                                            }}>
                                                {doc.fileType || (isPdf ? 'PDF' : isImg ? 'IMAGE' : 'FILE')}
                                            </span>

                                            <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                                                {doc.fileSize || 'N/A'}
                                            </span>
                                        </div>

                                        <h4
                                            onClick={() => setPreviewDoc(doc)}
                                            style={{
                                                margin: '0 0 6px 0',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: 'var(--adm-text-main)',
                                                lineHeight: '1.3',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                            title="Click to preview document"
                                        >
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

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {/* Preview in Modal Button (Circled in user screenshot) */}
                                            <button
                                                type="button"
                                                onClick={() => setPreviewDoc(doc)}
                                                className="adm-btn adm-btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                                                title="Preview Document"
                                            >
                                                <i className="fa-solid fa-arrow-up-right-from-square" />
                                            </button>

                                            {/* Direct Download Button */}
                                            {hasValidUrl ? (
                                                <a
                                                    href={docUrl}
                                                    download={doc.fileName || doc.title}
                                                    className="adm-btn adm-btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                                                    title="Download Document"
                                                >
                                                    <i className="fa-solid fa-download" />
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewDoc(doc)}
                                                    className="adm-btn adm-btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '12px', opacity: 0.65 }}
                                                    title="File link missing"
                                                >
                                                    <i className="fa-solid fa-circle-exclamation" style={{ color: '#f59e0b' }} />
                                                </button>
                                            )}

                                            {/* Delete Button */}
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
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 DOCUMENT PREVIEW MODAL (FULL VIEWER)
            ══════════════════════════════════════════════════════════════ */}
            {previewDoc && (() => {
                const resolvedUrl = getDocUrl(previewDoc);
                const hasValidUrl = resolvedUrl && resolvedUrl !== '#';

                return (
                    <div className="adm-doc-modal-overlay" onClick={() => { setPreviewDoc(null); setIsFullscreen(false); }}>
                        <div
                            className={`adm-doc-modal-container ${isFullscreen ? 'is-fullscreen' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="adm-doc-modal-header">
                                <div className="adm-doc-modal-title-wrap">
                                    <div className="adm-doc-modal-icon-badge" style={{
                                        background: isPdfDoc(previewDoc) ? 'rgba(239, 68, 68, 0.18)' : isImageDoc(previewDoc) ? 'rgba(56, 189, 248, 0.18)' : 'rgba(168, 85, 247, 0.18)',
                                        color: isPdfDoc(previewDoc) ? '#ef4444' : isImageDoc(previewDoc) ? '#38bdf8' : '#c084fc'
                                    }}>
                                        <i className={isPdfDoc(previewDoc) ? 'fa-solid fa-file-pdf' : isImageDoc(previewDoc) ? 'fa-solid fa-file-image' : isHtmlDoc(previewDoc) ? 'fa-solid fa-globe' : 'fa-solid fa-file-lines'} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <h3 className="adm-doc-modal-title">{previewDoc.title}</h3>
                                        <div className="adm-doc-modal-meta">
                                            <span style={{ color: '#38bdf8', fontWeight: '600' }}>{previewDoc.category}</span>
                                            {previewDoc.fileSize && <span>• {previewDoc.fileSize}</span>}
                                            {previewDoc.fileType && <span>• {previewDoc.fileType}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Toggle Fullscreen / Maximize */}
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="adm-doc-btn-icon"
                                        title={isFullscreen ? "Exit Fullscreen" : "Maximize / Fullscreen"}
                                    >
                                        <i className={isFullscreen ? "fa-solid fa-compress" : "fa-solid fa-expand"} />
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        type="button"
                                        onClick={() => { setPreviewDoc(null); setIsFullscreen(false); }}
                                        className="adm-doc-btn-icon"
                                        title="Close Preview (Esc)"
                                        style={{ color: '#f87171' }}
                                    >
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                </div>
                            </div>

                            {/* Body / Viewer */}
                            <div className="adm-doc-modal-body">
                                {!hasValidUrl ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--adm-text-muted)' }}>
                                        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '42px', color: '#f59e0b', marginBottom: '14px' }} />
                                        <h4 style={{ color: '#ffffff', margin: '0 0 8px 0' }}>File Link Not Available</h4>
                                        <p style={{ maxWidth: '420px', margin: '0 auto 20px auto', fontSize: '13px', lineHeight: '1.5' }}>
                                            This document was stored without an active file or the upload URL was missing. You can upload a new copy into your vault or delete this record.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewDoc(null); setShowUploadModal(true); }}
                                            className="adm-doc-btn-download"
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up" /> Upload Replacement Document
                                        </button>
                                    </div>
                                ) : isPdfDoc(previewDoc) ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                        <iframe
                                            src={`${resolvedUrl}#toolbar=1&navpanes=0`}
                                            title={previewDoc.title}
                                            className="adm-doc-modal-iframe"
                                        />
                                        <div style={{
                                            background: 'rgba(11, 17, 32, 0.95)',
                                            padding: '8px 16px',
                                            fontSize: '11.5px',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <i className="fa-solid fa-mobile-screen" style={{ color: '#38bdf8' }} />
                                                <span>Mobile tip: Tap <strong>Open in New Tab</strong> or <strong>Download</strong> for native high-speed reader.</span>
                                            </div>
                                            <a
                                                href={resolvedUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '700', fontSize: '11.5px' }}
                                            >
                                                Full View ↗
                                            </a>
                                        </div>
                                    </div>
                                ) : isImageDoc(previewDoc) ? (
                                    <div className="adm-doc-modal-img-wrap">
                                        <img
                                            src={resolvedUrl}
                                            alt={previewDoc.title}
                                            className="adm-doc-modal-img"
                                        />
                                    </div>
                                ) : isHtmlDoc(previewDoc) ? (
                                    <iframe
                                        src={resolvedUrl}
                                        title={previewDoc.title}
                                        className="adm-doc-modal-iframe"
                                        style={{ background: '#ffffff' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--adm-text-muted)' }}>
                                        <i className="fa-solid fa-file" style={{ fontSize: '48px', color: 'var(--adm-primary)', marginBottom: '16px' }} />
                                        <h4 style={{ color: 'var(--adm-text-main)', margin: '0 0 8px 0' }}>{previewDoc.fileName || previewDoc.title}</h4>
                                        <p style={{ maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '13px' }}>
                                            {previewDoc.description || 'This file format is ready for direct viewing or download.'}
                                        </p>
                                        <a
                                            href={resolvedUrl}
                                            download={previewDoc.fileName || previewDoc.title}
                                            className="adm-doc-btn-download"
                                        >
                                            <i className="fa-solid fa-download" /> Download File ({previewDoc.fileSize || 'File'})
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Footer Controls */}
                            <div className="adm-doc-modal-footer">
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {hasValidUrl && (
                                        <a
                                            href={resolvedUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="adm-doc-btn-tab"
                                        >
                                            <i className="fa-solid fa-arrow-up-right-from-square" /> Open in New Tab
                                        </a>
                                    )}

                                    {hasValidUrl && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopyUrl(previewDoc)}
                                            className="adm-doc-btn-copy"
                                        >
                                            <i className={copiedDocId ? 'fa-solid fa-check' : 'fa-solid fa-copy'} /> {copiedDocId ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {hasValidUrl && (
                                        <a
                                            href={resolvedUrl}
                                            download={previewDoc.fileName || previewDoc.title}
                                            className="adm-doc-btn-download"
                                        >
                                            <i className="fa-solid fa-download" /> Download Document
                                        </a>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => { setPreviewDoc(null); setIsFullscreen(false); }}
                                        className="adm-doc-btn-close"
                                    >
                                        <i className="fa-solid fa-xmark" /> Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                }} onClick={() => setShowUploadModal(false)}>
                    <div style={{
                        background: 'var(--adm-card-bg, #111827)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '16px',
                        maxWidth: '520px',
                        width: '100%',
                        padding: '24px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                    }} onClick={(e) => e.stopPropagation()}>
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
