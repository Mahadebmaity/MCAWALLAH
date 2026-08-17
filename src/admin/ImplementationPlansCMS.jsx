import { useState, useEffect } from 'react';
import ToastNotification from './ToastNotification';
import './admin.css';

const DEFAULT_PLANS = [
    {
        id: 'plan-01',
        title: 'Feature 01: AI Portfolio Assistant (Developer Digital Twin)',
        status: 'Completed',
        category: 'AI & Intelligence',
        date: 'August 2026',
        summary: 'Dual-core AI assistant powered by Google Gemini 3.6 Flash and built-in offline Semantic Knowledge Graph fallback, glassmorphic launcher widget, prompt chips, and Admin AI CMS.',
        tags: ['Gemini 3.6 Flash', 'Semantic Fallback', 'AI Assistant CMS', 'Chat Stream'],
        filePath: '/docs/implementation_plans/01_AI_PORTFOLIO_ASSISTANT_PLAN.md',
        content: `# Feature 1: AI Portfolio Assistant (Developer Digital Twin)
**Status:** Completed & Live 🟢  
**Target:** Public Portfolio & Admin Studio

---

## 🌟 Overview
A modern, interactive AI Portfolio Assistant that enables recruiters and visitors to converse naturally with an AI version of Mahadeb Maity. Answers questions regarding skills, featured projects, work experience, resume downloads, and contact options using live portfolio data from MongoDB.

## 🏗️ Architecture & Core Components
- **Dual-Core Backend Engine:** Supports Google Gemini 3.6 Flash via \`@google/genai\` when \`GEMINI_API_KEY\` is present, with an embedded Semantic Knowledge Graph fallback for zero-cost offline operations.
- **Floating Glassmorphic Widget:** Glowing launcher orb, quick prompt chips, real-time typing indicator, and interactive action cards (Download Resume, Jump to Contact, View Projects, Launch Arcade).
- **Dedicated Admin Studio CMS (\`/admin/ai-assistant\`):** Real-time visitor question transcripts, KPI analytics, persona customizer, prompt builder, action card toggles, and live sandbox simulator.`
    },
    {
        id: 'plan-02',
        title: 'Feature 02: Interactive Project Live Playground & Sandbox CMS',
        status: 'Completed',
        category: 'Interactive Tools',
        date: 'August 2026',
        summary: 'Inline live app runtime with 1-click responsive device viewport toggling (Desktop 100%, iPad 768px, Mobile 375px), multi-file code inspector, and dedicated Playground CMS in Admin Studio.',
        tags: ['Live Sandbox', 'Device Viewports', 'Playground CMS', 'Code Inspector'],
        filePath: '/docs/implementation_plans/02_INTERACTIVE_LIVE_PLAYGROUND_PLAN.md',
        content: `# Feature 2: Interactive Project Live Playground & Sandbox CMS
**Status:** Completed & Live 🟢  
**Target:** Public Portfolio Projects Showcase & Admin Studio

---

## 🌟 Overview
An interactive inline code sandbox and live working application playground that allows recruiters and visitors to interact with projects directly inside the portfolio without leaving the page. Includes responsive device viewport switchers (Desktop 100%, Tablet 768px, Mobile 375px) and source code architecture breakdown.

## 🏗️ Architecture & Core Components
- **Public Sandbox Modal:** Glassmorphic modal with device viewport switcher, live embedded app frame, and multi-file code inspector with syntax highlighting & 1-tap copy.
- **Dedicated Playground CMS (\`/admin/playground\`):** Add, edit, and manage project sandboxes, code snippets, live URLs, device frames, and live tester directly inside Admin Studio.
- **Backend Storage:** MongoDB \`Playground\` collection with public and admin RESTful API endpoints.`
    },
    {
        id: 'plan-03',
        title: 'Feature 03: Developer Command Palette (Ctrl+K Spotlight Search) & CMS',
        status: 'Completed',
        category: 'Interactive Tools & Navigation',
        date: 'August 2026',
        summary: 'Raycast/Vercel-style Command Palette with fuzzy search across projects, sandbox demos, verified resumes, skills, retro arcade minigames, and Admin Command Palette CMS.',
        tags: ['Ctrl+K Search', 'Keyboard Navigation', 'Command Palette CMS', 'Spotlight'],
        filePath: '/docs/implementation_plans/03_DEVELOPER_COMMAND_PALETTE_PLAN.md',
        content: `# Feature 3: Developer Command Palette (Ctrl+K Spotlight Search) & Command Palette CMS
**Status:** Completed & Live 🟢  
**Target:** Public Portfolio & Admin Studio

---

## 🌟 Overview
A modern, ultra-fast Developer Command Palette (\`Ctrl + K\` / \`Cmd + K\`) inspired by Vercel, Linear, and Raycast. It enables recruiters, engineers, and visitors to navigate anywhere, search projects, test live sandboxes, inspect skills, download verified resumes, launch retro minigames, and contact Mahadeb in a single keystroke.

## 🏗️ Architecture & Core Capabilities
- **Universal Keyboard Listener (\`Ctrl + K\` / \`Cmd + K\`):** Global listener across the entire portfolio with floating visual search trigger pills for touch & mobile devices.
- **Fuzzy Search Index:**
  - 🚀 **Projects & Sandboxes:** Instant jump to live apps, GitHub repositories, and interactive sandboxes.
  - 💡 **Skills & Tech Matrix:** Quick search across frontend, backend, databases, and DevOps tools.
  - 📄 **Resume & Documents:** 1-tap download triggers for latest resumes and technical documentation.
  - 🎮 **Developer Arcade:** Direct shortcuts to Retro Snake, 2048, Typing Challenge, and Tic-Tac-Toe AI.
  - 🤖 **AI Twin Quick Launcher:** Open the AI Assistant with pre-filled question prompts.
  - 📬 **Direct Contact:** Quick email, LinkedIn, and social handles redirect.
- **Keyboard Navigation:** Full support for \`↑\` Up, \`↓\` Down arrow navigation, \`Enter\` to execute, and \`Esc\` to dismiss.
- **Dedicated Admin Studio CMS (\`/admin/command-palette\`):** Manage custom shortcut commands, customize category groupings, and view search query analytics.`
    },
    {
        id: 'plan-04',
        title: 'Feature 04: Live GitHub Activity & Commit Telemetry Matrix',
        status: 'Planned',
        category: 'Developer Telemetry',
        date: 'Upcoming',
        summary: 'Real-time GitHub contribution matrix, live commit stream, starred repositories showcase, and interactive coding streak tracker.',
        tags: ['GitHub GraphQL API', 'Commit Matrix', 'Streak Counter', 'Repo Showcase'],
        filePath: null,
        content: `# Feature 4: Live GitHub Activity & Commit Telemetry Matrix
**Status:** Planned 💡  
**Target:** Public Portfolio & Admin Studio

---

## 🌟 Planned Specifications
1. **GitHub Activity Heatmap:** Real-time GitHub commit squares directly inside the portfolio.
2. **Top Repositories Cards:** Live star counts, fork telemetry, and language breakdown fetched from GitHub API.`
    },
    {
        id: 'plan-05',
        title: 'System Architecture & 28-Section Enterprise Technical Spec',
        status: 'Completed',
        category: 'System Documentation',
        date: 'August 2026',
        summary: 'Complete 28-section software engineering specification, Mermaid system architecture diagrams, REST API contract matrices, and deployment runbooks.',
        tags: ['28-Section Spec', 'Mermaid Diagrams', 'System Blueprint', 'Production Guide'],
        filePath: '/docs/PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf',
        content: `# MCA WALLAH Portfolio - 28-Section Comprehensive Enterprise Technical Documentation
**Status:** Completed & Certified 🟢  
**Format:** PDF & HTML Blueprint

---

## 🌟 Document Outline
1. Executive Summary & Problem Statement
2. Software Architecture & React 19 Client Tree
3. RESTful API Endpoints & Request-Response Contracts
4. MongoDB Atlas Schema Data Models
5. Multi-Resume Engine & PDF Generation Architecture
6. Dual-Core AI Assistant Architecture
7. Security Matrix, Rate Limiting & JWT Authentication
8. Production Deployment on Vercel & Node Server Runbooks`
    }
];

export default function ImplementationPlansCMS() {
    const [plans, setPlans] = useState(DEFAULT_PLANS);
    const [selectedPlan, setSelectedPlan] = useState(DEFAULT_PLANS[0]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);

    const handleCopyMarkdown = (text) => {
        navigator.clipboard.writeText(text);
        setToast({
            type: 'success',
            title: 'Copied! 📋',
            message: 'Full feature specification markdown copied to clipboard.'
        });
    };

    const handleDownloadMarkdown = (plan) => {
        const element = document.createElement('a');
        const file = new Blob([plan.content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${plan.id}_specification.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setToast({
            type: 'success',
            title: 'Downloaded! ⬇️',
            message: `Saved ${plan.id}_specification.md to your computer.`
        });
    };

    const filteredPlans = plans.filter(p => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="adm-page-container">
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══════════════════════════════════════════════════════════
                 TOP SPOTLIGHT & ROADMAP KPI BAR
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
                border: '1.5px solid rgba(168, 85, 247, 0.4)',
                marginBottom: '22px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{
                                background: 'rgba(168, 85, 247, 0.18)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                color: '#c084fc',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <i className="fa-solid fa-list-check" /> Feature Implementation Roadmaps &amp; Specs
                            </span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                                {plans.filter(p => p.status === 'Completed').length} Completed / {plans.length} Total
                            </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            Feature Implementation Plans &amp; Technical Roadmaps
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                            Centralized hub for all feature blueprints, technical architecture plans, and milestone documentation.
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '18px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Roadmaps</span>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#c084fc', marginTop: '3px' }}>{plans.length}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🟢 Completed &amp; Live</span>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#34d399', marginTop: '3px' }}>
                            {plans.filter(p => p.status === 'Completed').length}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Upcoming Features</span>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', marginTop: '3px' }}>
                            {plans.filter(p => p.status === 'Planned').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 MAIN SPLIT VIEW: PLANS SIDEBAR + FULL SPEC READER
            ══════════════════════════════════════════════════════════ */}
            <div className="adm-plans-split-grid">
                {/* ── Left Plans List ── */}
                <div className="adm-card" style={{ margin: 0, padding: '18px' }}>
                    {/* Status filter pills */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        {['All', 'Completed', 'Planned'].map(st => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setStatusFilter(st)}
                                className={`adm-tab-btn ${statusFilter === st ? 'active' : ''}`}
                                style={{
                                    background: statusFilter === st ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                                    color: statusFilter === st ? '#c084fc' : '#94a3b8',
                                    border: statusFilter === st ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    fontSize: '11.5px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    {/* Search box */}
                    <div className="adm-search-input-wrap" style={{ marginBottom: '14px' }}>
                        <i className="fa-solid fa-magnifying-glass adm-search-icon" />
                        <input
                            type="text"
                            placeholder="Search feature roadmaps..."
                            className="adm-input"
                            style={{ paddingLeft: '36px', fontSize: '12px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Plans items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '620px', overflowY: 'auto' }}>
                        {filteredPlans.map(plan => {
                            const isSelected = selectedPlan?.id === plan.id;
                            const isCompleted = plan.status === 'Completed';

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    style={{
                                        background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        border: isSelected ? '1.5px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        padding: '12px 14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? '0 4px 18px rgba(168, 85, 247, 0.25)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{
                                            fontSize: '10.5px',
                                            fontWeight: '700',
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                            color: isCompleted ? '#34d399' : '#fbbf24',
                                            border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`
                                        }}>
                                            {isCompleted ? '🟢 Live' : '💡 Planned'}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>{plan.date}</span>
                                    </div>

                                    <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: isSelected ? '#ffffff' : '#e2e8f0', margin: '0 0 4px 0', lineHeight: '1.35' }}>
                                        {plan.title}
                                    </h4>
                                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {plan.summary}
                                    </p>

                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {plan.tags.slice(0, 2).map((t, idx) => (
                                            <span key={idx} style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right Plan Spec Reader ── */}
                <div className="adm-card" style={{ margin: 0, padding: '24px', background: 'rgba(15, 23, 42, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.3)' }}>
                    {selectedPlan ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.09)', paddingBottom: '16px', marginBottom: '18px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{
                                            background: selectedPlan.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                            color: selectedPlan.status === 'Completed' ? '#34d399' : '#fbbf24',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '3px 10px',
                                            borderRadius: '6px'
                                        }}>
                                            {selectedPlan.status === 'Completed' ? '🟢 Feature Completed & Live' : '💡 Upcoming Feature Proposal'}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Category: {selectedPlan.category}</span>
                                    </div>
                                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                                        {selectedPlan.title}
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyMarkdown(selectedPlan.content)}
                                        className="adm-btn adm-btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        <i className="fa-solid fa-copy" /> Copy Markdown
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDownloadMarkdown(selectedPlan)}
                                        className="adm-btn adm-btn-primary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        <i className="fa-solid fa-download" /> Download .md
                                    </button>
                                </div>
                            </div>

                            {/* Markdown Spec Viewer Container */}
                            <div style={{
                                background: '#050811',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '20px',
                                maxHeight: '560px',
                                overflowY: 'auto'
                            }}>
                                <pre style={{
                                    color: '#e2e8f0',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '13px',
                                    lineHeight: '1.7',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0
                                }}>
                                    {selectedPlan.content}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                            <i className="fa-solid fa-file-lines" style={{ fontSize: '42px', color: '#64748b', marginBottom: '12px' }} />
                            <p>Select a feature roadmap from the list to view its complete technical specification.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
