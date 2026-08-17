import { useState, useEffect } from 'react';
import './PlaygroundModal.css';

export default function PlaygroundModal({ playground, onClose }) {
    const [viewMode, setViewMode] = useState(playground?.defaultView || 'live'); // 'live' | 'code' | 'architecture'
    const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
    const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!playground) return null;

    const snippets = playground.codeSnippets || [];
    const currentSnippet = snippets[activeSnippetIdx] || null;

    const handleCopyCode = () => {
        if (!currentSnippet?.code) return;
        navigator.clipboard.writeText(currentSnippet.code);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
    };

    return (
        <div className="pg-modal-overlay" onClick={onClose}>
            <div
                className={`pg-modal-container ${isFullscreen ? 'is-fullscreen' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ══════════════════════════════════════════════════════════
                     MODAL HEADER & CONTROLS
                ══════════════════════════════════════════════════════════ */}
                <div className="pg-modal-header">
                    {/* Left title info */}
                    <div className="pg-header-left">
                        <div className="pg-title-badge">
                            <i className="fa-solid fa-laptop-code" />
                        </div>
                        <div>
                            <h3 className="pg-title">{playground.title}</h3>
                            <div className="pg-subtitle">
                                <span style={{ color: '#38bdf8', fontWeight: '700' }}>{playground.category || 'Live Sandbox'}</span>
                                {playground.tags && playground.tags.length > 0 && (
                                    <span>• {playground.tags.slice(0, 3).join(', ')}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Mode & Device Switcher */}
                    <div className="pg-header-center">
                        {/* View Switcher: Live Demo / Code / Architecture */}
                        <div className="pg-pill-switcher">
                            <button
                                type="button"
                                onClick={() => setViewMode('live')}
                                className={`pg-pill-btn ${viewMode === 'live' ? 'active' : ''}`}
                            >
                                <i className="fa-solid fa-play" /> Live App
                            </button>

                            {snippets.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('code')}
                                    className={`pg-pill-btn ${viewMode === 'code' ? 'active' : ''}`}
                                >
                                    <i className="fa-solid fa-code" /> Code ({snippets.length})
                                </button>
                            )}

                            {playground.architectureNotes && (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('architecture')}
                                    className={`pg-pill-btn ${viewMode === 'architecture' ? 'active' : ''}`}
                                >
                                    <i className="fa-solid fa-sitemap" /> Architecture
                                </button>
                            )}
                        </div>

                        {/* Device Viewport Switcher (Only active during Live App view) */}
                        {viewMode === 'live' && (
                            <div className="pg-pill-switcher" title="Simulate Viewport Frame">
                                <button
                                    type="button"
                                    onClick={() => setDeviceMode('desktop')}
                                    className={`pg-pill-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                                    title="Desktop (100%)"
                                >
                                    <i className="fa-solid fa-desktop" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeviceMode('tablet')}
                                    className={`pg-pill-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
                                    title="Tablet iPad Frame (768px)"
                                >
                                    <i className="fa-solid fa-tablet-screen-button" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeviceMode('mobile')}
                                    className={`pg-pill-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                                    title="Smartphone Mobile Frame (375px)"
                                >
                                    <i className="fa-solid fa-mobile-screen" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Action buttons */}
                    <div className="pg-header-right">
                        {playground.liveUrl && (
                            <a
                                href={playground.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="pg-action-btn"
                                title="Open Live App in New Tab"
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square" /> Open Tab
                            </a>
                        )}

                        {playground.githubUrl && (
                            <a
                                href={playground.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="pg-action-btn"
                                title="View GitHub Source Repository"
                            >
                                <i className="fa-brands fa-github" /> GitHub
                            </a>
                        )}

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="pg-action-btn icon-only"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Maximize"}
                        >
                            <i className={isFullscreen ? "fa-solid fa-compress" : "fa-solid fa-expand"} />
                        </button>

                        {/* Close Modal */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="pg-action-btn icon-only close"
                            title="Close Sandbox (Esc)"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                     SANDBOX BODY & RUNTIME VIEW
                ══════════════════════════════════════════════════════════ */}
                <div className="pg-modal-body">
                    {/* 1. Live Embedded App View */}
                    {viewMode === 'live' && (
                        <div className="pg-sandbox-stage">
                            {playground.liveUrl ? (
                                <div className={`pg-device-frame ${deviceMode}`}>
                                    <iframe
                                        src={playground.liveUrl}
                                        title={playground.title}
                                        className="pg-iframe"
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    />
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '42px', color: '#f59e0b', marginBottom: '14px' }} />
                                    <h4 style={{ color: '#ffffff', margin: '0 0 8px 0' }}>Live Frame Not Configured</h4>
                                    <p style={{ maxWidth: '420px', margin: '0 auto 16px auto', fontSize: '13px' }}>
                                        This project can be explored via the <strong>Code Breakdown</strong> tab or GitHub repository.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('code')}
                                        className="adm-doc-btn-tab"
                                    >
                                        <i className="fa-solid fa-code" /> Inspect Source Code
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Source Code Inspector View */}
                    {viewMode === 'code' && (
                        <div className="pg-code-inspector">
                            {/* File tabs */}
                            {snippets.length > 0 && (
                                <div className="pg-code-sidebar-tabs">
                                    {snippets.map((snip, sIdx) => (
                                        <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() => setActiveSnippetIdx(sIdx)}
                                            className={`pg-code-tab ${activeSnippetIdx === sIdx ? 'active' : ''}`}
                                        >
                                            <i className="fa-solid fa-file-code" /> {snip.title}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Code snippet content */}
                            <div className="pg-code-content-area">
                                {currentSnippet ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="pg-code-copy-btn"
                                        >
                                            <i className={copiedSnippet ? "fa-solid fa-check" : "fa-solid fa-copy"} />
                                            {copiedSnippet ? "Copied!" : "Copy Code"}
                                        </button>
                                        <pre className="pg-code-block">
                                            <code>{currentSnippet.code}</code>
                                        </pre>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No code snippets added for this project yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. System Architecture Breakdown View */}
                    {viewMode === 'architecture' && (
                        <div style={{ width: '100%', height: '100%', padding: '24px', overflow: 'auto', background: '#070a14' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                        <i className="fa-solid fa-sitemap" style={{ color: '#38bdf8', fontSize: '20px' }} />
                                        <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px' }}>
                                            Engineering Architecture &amp; Specifications
                                        </h3>
                                    </div>

                                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                        {playground.architectureNotes || playground.description || 'Complete architectural specifications and technical contracts.'}
                                    </p>

                                    {playground.tags && playground.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
                                            {playground.tags.map((tag, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '4px 12px', borderRadius: '999px', fontWeight: '600' }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
