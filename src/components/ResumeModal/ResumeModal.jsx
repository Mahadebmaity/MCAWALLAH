import { useState, useEffect } from 'react';
import { getDocUrl, downloadFile } from '../../config/api';
import './ResumeModal.css';

export default function ResumeModal({ resume, onClose }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [viewerEngine, setViewerEngine] = useState('auto'); // 'direct', 'gdocs', 'img'

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!resume) return null;

    const rawUrl = resume.url || resume.fileUrl || resume.secure_url || resume;
    const resolvedUrl = getDocUrl(rawUrl);
    const title = resume.title || resume.fileName || 'Mahadeb Maity — Verified Resume';
    const fileSize = resume.fileSize || 'PDF Document';

    const isCloudinary = typeof resolvedUrl === 'string' && resolvedUrl.includes('res.cloudinary.com');
    const isRemoteHttps = typeof resolvedUrl === 'string' && resolvedUrl.startsWith('https://');

    // Cloudinary high-res rendered image URL for guaranteed viewing
    const cloudinaryImgUrl = isCloudinary 
        ? resolvedUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/').replace(/\.pdf$/i, '.jpg')
        : '';

    // Google Docs Viewer for seamless remote viewing
    const gDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resolvedUrl)}&embedded=true`;

    // Compute active preview URL based on engine
    let activeSrc = `${resolvedUrl}#toolbar=1&navpanes=0`;
    if (viewerEngine === 'gdocs') {
        activeSrc = gDocsViewerUrl;
    } else if (viewerEngine === 'img' && cloudinaryImgUrl) {
        activeSrc = cloudinaryImgUrl;
    }

    const handleCopyLink = () => {
        const fullUrl = resolvedUrl.startsWith('http') ? resolvedUrl : `${window.location.origin}${resolvedUrl}`;
        navigator.clipboard?.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const handleDownload = () => {
        downloadFile(resolvedUrl, title);
    };

    return (
        <div className="resume-modal__overlay" onClick={onClose}>
            <div
                className={`resume-modal__container ${isFullscreen ? 'resume-modal__container--fullscreen' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Modal Header ── */}
                <div className="resume-modal__header">
                    <div className="resume-modal__header-left">
                        <div className="resume-modal__icon-badge">
                            <i className="fa-solid fa-file-pdf" />
                        </div>
                        <div className="resume-modal__title-wrap">
                            <h3 className="resume-modal__title">{title}</h3>
                            <div className="resume-modal__subtitle">
                                <span className="resume-modal__tag">Mahadeb Maity CV</span>
                                <span className="resume-modal__meta">• {fileSize}</span>
                                <span className="resume-modal__meta">• Verified PDF</span>
                            </div>
                        </div>
                    </div>

                    <div className="resume-modal__header-actions">
                        {/* Viewer Engine Selector */}
                        <div className="resume-modal__engine-selector">
                            <button
                                type="button"
                                className={`resume-modal__engine-btn ${viewerEngine === 'auto' || viewerEngine === 'direct' ? 'active' : ''}`}
                                onClick={() => setViewerEngine('direct')}
                                title="Standard Browser PDF Viewer"
                            >
                                📄 Direct
                            </button>
                            <button
                                type="button"
                                className={`resume-modal__engine-btn ${viewerEngine === 'gdocs' ? 'active' : ''}`}
                                onClick={() => setViewerEngine('gdocs')}
                                title="Google Docs PDF Viewer (Fixes Blank / Blocked Previews)"
                            >
                                ⚡ Google Reader
                            </button>
                            {isCloudinary && (
                                <button
                                    type="button"
                                    className={`resume-modal__engine-btn ${viewerEngine === 'img' ? 'active' : ''}`}
                                    onClick={() => setViewerEngine('img')}
                                    title="Crisp Image Preview (Cloudinary Page Render)"
                                >
                                    🖼️ Image
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="resume-modal__btn-icon"
                            title={isFullscreen ? "Exit Fullscreen" : "Maximize / Fullscreen"}
                        >
                            <i className={isFullscreen ? "fa-solid fa-compress" : "fa-solid fa-expand"} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="resume-modal__btn-icon resume-modal__btn-icon--close"
                            title="Close Preview (Esc)"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>

                {/* ── Modal PDF Viewer Body ── */}
                <div className="resume-modal__body">
                    {viewerEngine === 'img' && cloudinaryImgUrl ? (
                        <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', background: '#0a0f1d', padding: '16px' }}>
                            <img
                                src={cloudinaryImgUrl}
                                alt={title}
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                            />
                        </div>
                    ) : (
                        <iframe
                            key={activeSrc}
                            src={activeSrc}
                            title={title}
                            className="resume-modal__iframe"
                        />
                    )}
                    <div className="resume-modal__mobile-bar">
                        <div className="resume-modal__mobile-tip">
                            <i className="fa-solid fa-circle-info" />
                            <span>Preview issue? Click <strong>⚡ Google Reader</strong> above or tap <strong>Open in New Tab</strong>.</span>
                        </div>
                        <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="resume-modal__fullview-link"
                        >
                            Full View ↗
                        </a>
                    </div>
                </div>

                {/* ── Modal Footer Controls ── */}
                <div className="resume-modal__footer">
                    <div className="resume-modal__footer-left">
                        <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="resume-modal__btn resume-modal__btn--secondary"
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square" /> Open in New Tab
                        </a>

                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="resume-modal__btn resume-modal__btn--secondary"
                        >
                            <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"} /> {copied ? 'Link Copied!' : 'Copy Link'}
                        </button>
                    </div>

                    <div className="resume-modal__footer-right">
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="resume-modal__btn resume-modal__btn--primary"
                        >
                            <i className="fa-solid fa-download" /> Download Document
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="resume-modal__btn resume-modal__btn--close-text"
                        >
                            <i className="fa-solid fa-xmark" /> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

