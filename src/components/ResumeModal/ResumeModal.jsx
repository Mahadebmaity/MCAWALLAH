import { useState, useEffect } from 'react';
import { getDocUrl, downloadFile } from '../../config/api';
import './ResumeModal.css';

export default function ResumeModal({ resume, onClose }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!resume) return null;

    const resolvedUrl = getDocUrl(resume.url || resume);
    const title = resume.title || resume.fileName || 'Mahadeb Maity — Verified Resume';
    const fileSize = resume.fileSize || 'PDF Document';

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
                    <iframe
                        src={`${resolvedUrl}#toolbar=1&navpanes=0`}
                        title={title}
                        className="resume-modal__iframe"
                    />
                    <div className="resume-modal__mobile-bar">
                        <div className="resume-modal__mobile-tip">
                            <i className="fa-solid fa-mobile-screen" />
                            <span>Mobile tip: Tap <strong>Open in New Tab</strong> or <strong>Download</strong> for native reader.</span>
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
