import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, getDocUrl } from '../../config/api';
import './AiAssistant.css';

const INITIAL_PROMPTS = [
    '💡 What are Mahadeb\'s top skills?',
    '🚀 Show me his React projects',
    '📄 Download his verified resume',
    '📬 How can I contact or hire him?',
    '🎮 Play games in Arcade Lounge'
];

export default function AiAssistant() {
    const navigate = useNavigate();
    const { user, authModalOpen } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [aiConfig, setAiConfig] = useState({
        enabled: true,
        twinName: "Mahadeb's AI Digital Twin",
        launcherText: "Ask AI Twin",
        avatarIcon: "fa-robot",
        welcomeMessage: "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!",
        quickPrompts: INITIAL_PROMPTS
    });

    const [messages, setMessages] = useState([
        {
            id: 'welcome-init',
            sender: 'assistant',
            text: "👋 Hi there! I'm **Mahadeb's AI Digital Twin & Portfolio Assistant**.\n\nAsk me anything about his **skills, featured projects, work experience, resume downloads**, or how to get in touch for full-time & freelance opportunities!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedPrompts: INITIAL_PROMPTS,
            actionCards: [
                {
                    type: 'resume',
                    title: 'Download Resume (PDF)',
                    icon: 'fa-solid fa-file-pdf',
                    target: '/resume.pdf',
                    actionText: 'Download'
                },
                {
                    type: 'scroll',
                    title: 'Contact Form',
                    icon: 'fa-solid fa-envelope',
                    target: 'contact',
                    actionText: "Let's Talk"
                }
            ]
        }
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // ── Screen Resize Listener ──
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Draggable State & Handlers ──
    const [position, setPosition] = useState({ x: null, y: null });
    const isDraggingRef = useRef(false);
    const dragDataRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0, moved: false });
    const launcherRef = useRef(null);

    const handlePointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return; // Left click only
        const rect = launcherRef.current?.getBoundingClientRect();
        if (!rect) return;

        isDraggingRef.current = true;
        dragDataRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initX: position.x !== null ? position.x : rect.left,
            initY: position.y !== null ? position.y : rect.top,
            moved: false
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - dragDataRef.current.startX;
        const dy = e.clientY - dragDataRef.current.startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            dragDataRef.current.moved = true;
        }

        const orbWidth = launcherRef.current?.offsetWidth || 60;
        const orbHeight = launcherRef.current?.offsetHeight || 60;
        const nextX = Math.max(8, Math.min(window.innerWidth - orbWidth - 8, dragDataRef.current.initX + dx));
        const nextY = Math.max(8, Math.min(window.innerHeight - orbHeight - 8, dragDataRef.current.initY + dy));

        setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };

    const handleLauncherClick = (e) => {
        if (dragDataRef.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            dragDataRef.current.moved = false;
            return;
        }
        setIsOpen(!isOpen);
    };

    // Fetch dynamic AI Configuration from API
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE}/portfolio/ai/config`);
                if (res.ok) {
                    const data = await res.json();
                    setAiConfig(data);
                    
                    // Update initial welcome message prompts with backend configured prompts
                    setMessages(prev => {
                        if (prev.length === 1 && prev[0].id === 'welcome-init') {
                            return [{
                                ...prev[0],
                                text: data.welcomeMessage || prev[0].text,
                                suggestedPrompts: (data.quickPrompts && data.quickPrompts.length > 0) ? data.quickPrompts : INITIAL_PROMPTS
                            }];
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.warn('Using default AI assistant configuration:', err.message);
            }
        };
        fetchConfig();
    }, []);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnreadCount(0);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, messages]);

    // Prevent body scroll on mobile when chat is full screen
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, isMobile]);

    // Gating check: Don't render floating widget if user is not authenticated or auth modal is active
    if (!user || authModalOpen || !aiConfig.enabled) {
        return null;
    }

    // Send Message Handler
    const handleSend = async (customText = null) => {
        const textToSend = typeof customText === 'string' ? customText : input;
        if (!textToSend || !textToSend.trim() || loading) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: textToSend.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/portfolio/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    conversationHistory: updatedHistory.map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(`Server returned non-JSON response (${res.status})`);
            }

            if (res.ok && data.success) {
                const assistantMsg = {
                    id: `ai-${Date.now()}`,
                    sender: 'assistant',
                    text: data.reply || "I'm ready to answer any questions about Mahadeb's experience!",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    suggestedPrompts: data.suggestedPrompts || aiConfig.quickPrompts || INITIAL_PROMPTS,
                    actionCards: data.actionCards || [],
                    source: data.source
                };
                setMessages(prev => [...prev, assistantMsg]);
                if (!isOpen) setUnreadCount(prev => prev + 1);
            } else {
                throw new Error(data.message || 'AI Assistant response failed');
            }
        } catch (err) {
            console.error('AI chat error:', err);
            const fallbackPrompts = aiConfig.quickPrompts?.length ? aiConfig.quickPrompts : INITIAL_PROMPTS;
            const errorMsg = {
                id: `ai-err-${Date.now()}`,
                sender: 'assistant',
                text: `💡 **Mahadeb Maity** is a **Full Stack Developer** specializing in **React 19, Node.js, Express, and MongoDB**.\n\nYou can reach him at \`mahadeb@portfolio.com\` or download his verified resume below.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestedPrompts: fallbackPrompts,
                actionCards: [
                    {
                        type: 'resume',
                        title: 'Download Resume',
                        icon: 'fa-solid fa-file-pdf',
                        target: '/resume.pdf',
                        actionText: 'Download'
                    }
                ]
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Action Trigger (Smooth Scroll, Resume Download, Navigation)
    const handleActionClick = (action) => {
        if (!action) return;

        if (action.type === 'scroll') {
            const targetId = action.target?.replace(/^#/, '');
            const el = document.getElementById(targetId);
            if (el) {
                if (isMobile) setIsOpen(false);
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), isMobile ? 200 : 0);
            }
        } else if (action.type === 'resume' || action.type === 'doc') {
            const url = getDocUrl(action.target);
            const link = document.createElement('a');
            link.href = url;
            link.download = action.target.split('/').pop() || 'resume.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (action.type === 'navigate') {
            if (isMobile) setIsOpen(false);
            navigate(action.target);
        } else if (action.type === 'link') {
            window.open(action.target, '_blank', 'noopener,noreferrer');
        }
    };

    // Clear Chat History
    const handleClearChat = () => {
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                sender: 'assistant',
                text: "✨ Conversation cleared! How else can I assist you with **Mahadeb's portfolio** today?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestedPrompts: aiConfig.quickPrompts || INITIAL_PROMPTS,
                actionCards: [
                    {
                        type: 'resume',
                        title: 'Download Resume (PDF)',
                        icon: 'fa-solid fa-file-pdf',
                        target: '/resume.pdf',
                        actionText: 'Download'
                    }
                ]
            }
        ]);
    };

    // Helper: Formats basic markdown (*bullet*, **bold**, `code`, URLs) into JSX
    const renderFormattedText = (rawText) => {
        if (!rawText) return null;

        const lines = rawText.split('\n');
        return lines.map((line, idx) => {
            if (!line.trim()) {
                return <div key={idx} style={{ height: '6px' }} />;
            }

            // Bullet lists
            const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
            const cleanLine = isBullet ? line.trim().replace(/^[\*\-]\s+/, '') : line;

            // Simple parser for bold **text** and code `code`
            const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

            const renderedLine = parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={pIdx}>{part.slice(1, -1)}</code>;
                }
                return part;
            });

            if (isBullet) {
                return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '3px 0' }}>
                        <span style={{ color: '#38bdf8', fontSize: '10px', marginTop: '4px' }}>•</span>
                        <div>{renderedLine}</div>
                    </div>
                );
            }

            return <p key={idx}>{renderedLine}</p>;
        });
    };

    // Current active suggestions
    const currentPrompts = messages.length > 0 && messages[messages.length - 1].suggestedPrompts?.length > 0
        ? messages[messages.length - 1].suggestedPrompts
        : (aiConfig.quickPrompts?.length > 0 ? aiConfig.quickPrompts : INITIAL_PROMPTS);

    return (
        <>
            {/* ══════════════════════════════════════════════════════════
                 FLOATING LAUNCHER ORB / BADGE (DRAGGABLE & SAFE POSITION)
            ══════════════════════════════════════════════════════════ */}
            <div
                ref={launcherRef}
                className={`ai-assistant-launcher ${isOpen ? 'is-active-open' : ''}`}
                onPointerDown={handlePointerDown}
                onClick={handleLauncherClick}
                style={{
                    position: 'fixed',
                    ...(position.x !== null ? {
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        right: 'auto',
                        bottom: 'auto'
                    } : {
                        right: '24px',
                        bottom: isMobile ? '86px' : '92px'
                    }),
                    zIndex: 9996,
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                    touchAction: 'none'
                }}
                title="Chat with Mahadeb's AI Assistant (Drag to move)"
            >
                <div className="ai-launcher-badge-pill" style={{ cursor: 'inherit' }}>
                    <span className="ai-online-dot" />
                    <span>{aiConfig.launcherText || "Ask AI Twin"}</span>
                    {unreadCount > 0 && (
                        <span className="ai-unread-badge">
                            {unreadCount}
                        </span>
                    )}
                </div>

                <div className="ai-assistant-launcher-orb" style={{ cursor: 'inherit' }}>
                    <div className="ai-launcher-pulse-ring" />
                    {isOpen ? (
                        <i className="fa-solid fa-xmark" />
                    ) : aiConfig.avatarIcon === 'fa-robot' || !aiConfig.avatarIcon ? (
                        <i className="fa-solid fa-wand-magic-sparkles" style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))'
                        }} />
                    ) : (
                        <i className={`fa-solid ${aiConfig.avatarIcon}`} />
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 MOBILE DEDICATED FULL-SCREEN CHAT EXPERIENCE
            ══════════════════════════════════════════════════════════ */}
            {isOpen && isMobile && (
                <div className="ai-mobile-chat-screen">
                    {/* Mobile App Bar */}
                    <div className="ai-mobile-header">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="ai-mobile-back-btn"
                            title="Back to portfolio"
                        >
                            <i className="fa-solid fa-arrow-left" />
                            <span>Back</span>
                        </button>

                        <div className="ai-mobile-header-center">
                            <div className="ai-avatar-badge" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                <i className="fa-solid fa-robot" />
                            </div>
                            <div className="ai-mobile-header-titles">
                                <h4 className="ai-chat-title">{aiConfig.twinName || "AI Assistant"}</h4>
                                <div className="ai-chat-subtitle">
                                    <span className="ai-online-dot" />
                                    <span>Online • Instant Response</span>
                                </div>
                            </div>
                        </div>

                        <div className="ai-mobile-header-actions">
                            <button
                                type="button"
                                onClick={handleClearChat}
                                className="ai-header-btn"
                                title="Clear Conversation"
                            >
                                <i className="fa-solid fa-rotate-left" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="ai-header-btn close"
                                title="Close"
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="ai-chat-messages ai-chat-messages-mobile">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`ai-message ${msg.sender}`}>
                                <div className="ai-msg-avatar">
                                    <i className={msg.sender === 'assistant' ? "fa-solid fa-sparkles" : "fa-solid fa-user"} />
                                </div>

                                <div className="ai-msg-bubble">
                                    <div>{renderFormattedText(msg.text)}</div>

                                    {msg.actionCards && msg.actionCards.length > 0 && (
                                        <div className="ai-action-cards-wrap">
                                            {msg.actionCards.map((card, cIdx) => (
                                                <button
                                                    key={cIdx}
                                                    type="button"
                                                    onClick={() => handleActionClick(card)}
                                                    className="ai-action-card-btn"
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className={card.icon || 'fa-solid fa-arrow-right'} style={{ color: '#38bdf8' }} />
                                                        <span>{card.title}</span>
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {card.actionText || 'Open'} ➔
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <span className="ai-msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message assistant">
                                <div className="ai-msg-avatar">
                                    <i className="fa-solid fa-sparkles" />
                                </div>
                                <div className="ai-typing-indicator">
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Responsive Suggestion Chips (Always cleanly visible) */}
                    {currentPrompts && currentPrompts.length > 0 && (
                        <div className="ai-suggested-prompts-mobile">
                            <div className="ai-prompts-label">
                                <i className="fa-solid fa-lightbulb" style={{ color: '#fbbf24' }} /> Suggested Questions:
                            </div>
                            <div className="ai-prompts-chip-list">
                                {currentPrompts.map((prompt, pIdx) => (
                                    <button
                                        key={pIdx}
                                        type="button"
                                        onClick={() => handleSend(prompt)}
                                        className="ai-prompt-chip"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Input Area */}
                    <form
                        className="ai-chat-input-area ai-chat-input-mobile"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            className="ai-chat-input"
                            placeholder="Ask Mahadeb's AI about skills, resume, projects..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            className="ai-send-btn"
                            disabled={!input.trim() || loading}
                            title="Send Message"
                        >
                            <i className="fa-solid fa-paper-plane" />
                        </button>
                    </form>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                 DESKTOP EXPANDABLE GLASSMORPHIC CHAT WINDOW
            ══════════════════════════════════════════════════════════ */}
            {isOpen && !isMobile && (
                <div className="ai-chat-window">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-info">
                            <div className="ai-avatar-badge">
                                <i className="fa-solid fa-robot" />
                            </div>
                            <div>
                                <h4 className="ai-chat-title">{aiConfig.twinName || "Mahadeb's AI Digital Twin"}</h4>
                                <div className="ai-chat-subtitle">
                                    <span className="ai-online-dot" />
                                    <span>AI Assistant • Ready to help</span>
                                </div>
                            </div>
                        </div>

                        <div className="ai-header-actions">
                            <button
                                type="button"
                                onClick={handleClearChat}
                                className="ai-header-btn"
                                title="Clear Conversation"
                            >
                                <i className="fa-solid fa-rotate-left" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="ai-header-btn close"
                                title="Minimize"
                            >
                                <i className="fa-solid fa-chevron-down" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="ai-chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`ai-message ${msg.sender}`}>
                                <div className="ai-msg-avatar">
                                    <i className={msg.sender === 'assistant' ? "fa-solid fa-sparkles" : "fa-solid fa-user"} />
                                </div>

                                <div className="ai-msg-bubble">
                                    <div>{renderFormattedText(msg.text)}</div>

                                    {/* Action Cards if available */}
                                    {msg.actionCards && msg.actionCards.length > 0 && (
                                        <div className="ai-action-cards-wrap">
                                            {msg.actionCards.map((card, cIdx) => (
                                                <button
                                                    key={cIdx}
                                                    type="button"
                                                    onClick={() => handleActionClick(card)}
                                                    className="ai-action-card-btn"
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className={card.icon || 'fa-solid fa-arrow-right'} style={{ color: '#38bdf8' }} />
                                                        <span>{card.title}</span>
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {card.actionText || 'Open'} ➔
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <span className="ai-msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing Animation */}
                        {loading && (
                            <div className="ai-message assistant">
                                <div className="ai-msg-avatar">
                                    <i className="fa-solid fa-sparkles" />
                                </div>
                                <div className="ai-typing-indicator">
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Quick Prompt Chips */}
                    {currentPrompts && currentPrompts.length > 0 && (
                        <div className="ai-suggested-prompts">
                            {currentPrompts.map((prompt, pIdx) => (
                                <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => handleSend(prompt)}
                                    className="ai-prompt-chip"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form
                        className="ai-chat-input-area"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            className="ai-chat-input"
                            placeholder="Ask me about Mahadeb's skills, projects, resume..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            className="ai-send-btn"
                            disabled={!input.trim() || loading}
                            title="Send Message"
                        >
                            <i className="fa-solid fa-paper-plane" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
