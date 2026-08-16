import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function MessagesInbox() {
    const { authFetch } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'archived'
    const [toast, setToast] = useState(null);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const fetchMessages = async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/messages`);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setMessages(list);
                if (list.length > 0 && !selectedMsg) {
                    setSelectedMsg(list[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markStatus = async (id, isRead, isArchived) => {
        try {
            const payload = {};
            if (typeof isRead === 'boolean') payload.isRead = isRead;
            if (typeof isArchived === 'boolean') payload.isArchived = isArchived;

            const res = await authFetch(`${API_BASE}/admin/messages/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const raw = await res.json();
                const updated = raw?.data || raw;
                setMessages(prev => prev.map(m => m._id === id ? { ...m, ...updated } : m));
                if (selectedMsg?._id === id) {
                    setSelectedMsg(prev => ({ ...prev, ...updated }));
                }

                if (typeof isArchived === 'boolean') {
                    setToast({
                        type: 'success',
                        title: isArchived ? 'Message Archived 📁' : 'Message Moved to Inbox 📥',
                        message: isArchived ? 'Message moved to archive folder.' : 'Message restored to active inbox.'
                    });
                }
            }
        } catch (err) {
            console.error('Status update failed:', err);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete message from "${name || 'this sender'}"?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/section/messages/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const filtered = messages.filter(m => m._id !== id);
                setMessages(filtered);
                setSelectedMsg(filtered[0] || null);
                setToast({
                    type: 'success',
                    title: 'Message Deleted 🗑️',
                    message: 'Feedback message removed permanently.'
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

    const selectMessage = (msg) => {
        if (!msg) return;
        setSelectedMsg(msg);
        if (!msg.isRead) {
            markStatus(msg._id, true);
        }
    };

    const handleCopyEmail = (emailStr) => {
        if (!emailStr) return;
        navigator.clipboard.writeText(emailStr);
        setCopiedEmail(true);
        setToast({
            type: 'success',
            title: 'Email Copied! 📋',
            message: `${emailStr} copied to clipboard.`
        });
        setTimeout(() => setCopiedEmail(false), 3000);
    };

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.isRead && !m.isArchived;
        if (filter === 'archived') return m.isArchived;
        return !m.isArchived;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Feedback Messages...</div>;

    const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

    // Direct Gmail Web compose URL with pre-filled subject and greeting
    const gmailComposeUrl = selectedMsg?.email
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMsg.email)}&su=${encodeURIComponent('Re: ' + (selectedMsg.subject || 'Portfolio Inquiry'))}&body=${encodeURIComponent(`Hi ${selectedMsg.name || ''},\n\nThank you for reaching out through my portfolio!\n\n---\nOriginal Message from ${selectedMsg.name} (${new Date(selectedMsg.createdAt).toLocaleString()}):\n"${selectedMsg.message}"\n\nBest regards,\nMahadeb Maity`)}`
        : '#';

    // Standard mailto link
    const mailtoUrl = selectedMsg?.email
        ? `mailto:${selectedMsg.email}?subject=${encodeURIComponent('Re: ' + (selectedMsg.subject || 'Portfolio Inquiry'))}&body=${encodeURIComponent(`Hi ${selectedMsg.name || ''},\n\nThank you for reaching out!\n\n---\n"${selectedMsg.message}"`)}`
        : '#';

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <div className="adm-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="adm-inbox-split" style={{ display: 'flex', minHeight: '620px' }}>
                    {/* ── Left Pane: Message List ── */}
                    <div className="adm-inbox-sidebar" style={{
                        width: '360px',
                        borderRight: '1px solid var(--adm-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(15, 23, 42, 0.5)'
                    }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--adm-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-inbox" style={{ color: 'var(--adm-primary)' }} />
                                    Inbox Messages
                                </h3>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: unreadCount > 0 ? '#38bdf8' : 'var(--adm-text-muted)',
                                    background: unreadCount > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    border: unreadCount > 0 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--adm-border)'
                                }}>
                                    {unreadCount} Unread
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['all', 'unread', 'archived'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            fontSize: '12px',
                                            textTransform: 'capitalize',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: filter === f ? 'var(--adm-primary)' : 'rgba(255,255,255,0.06)',
                                            color: filter === f ? '#090d16' : '#fff',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        onClick={() => selectMessage(msg)}
                                        style={{
                                            padding: '14px 16px',
                                            borderBottom: '1px solid var(--adm-border)',
                                            cursor: 'pointer',
                                            background: selectedMsg?._id === msg._id
                                                ? 'rgba(56, 189, 248, 0.12)'
                                                : msg.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                                            borderLeft: !msg.isRead ? '3px solid var(--adm-primary)' : '3px solid transparent',
                                            transition: 'background 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '13px', color: msg.isRead ? '#cbd5e1' : '#fff' }}>
                                                {msg.name}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8', fontWeight: msg.isRead ? '400' : '700' }}>
                                            {msg.subject || 'No Subject'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.message}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--adm-text-muted)', fontSize: '13px' }}>
                                    <i className="fa-solid fa-envelope-open" style={{ fontSize: '24px', opacity: 0.4, marginBottom: '10px', display: 'block' }} />
                                    No messages in {filter}.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right Pane: Message Reader ── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--adm-surface)' }}>
                        {selectedMsg ? (
                            <>
                                <div style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--adm-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div style={{ minWidth: '220px' }}>
                                        <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--adm-text-main)', wordBreak: 'break-word' }}>
                                            {selectedMsg.subject || 'Portfolio Inquiry'}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--adm-text-muted)', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span>From: <strong style={{ color: 'var(--adm-text-main)' }}>{selectedMsg.name}</strong> &lt;{selectedMsg.email}&gt;</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyEmail(selectedMsg.email)}
                                                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                title="Copy email address"
                                            >
                                                <i className={`fa-solid ${copiedEmail ? 'fa-check' : 'fa-copy'}`} />
                                                {copiedEmail ? 'Copied' : 'Copy'}
                                            </button>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* 1-Click Open in Gmail Web */}
                                        <a
                                            href={gmailComposeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="adm-btn adm-btn-primary adm-btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                                            title="Open Gmail Composer in New Tab"
                                        >
                                            <i className="fa-solid fa-reply"></i>
                                            <span>Reply via Email</span>
                                        </a>

                                        {/* Fallback Standard Mail Client Link */}
                                        <a
                                            href={mailtoUrl}
                                            className="adm-btn adm-btn-secondary adm-btn-sm"
                                            style={{ textDecoration: 'none' }}
                                            title="Open default email app (Outlook / Apple Mail)"
                                        >
                                            <i className="fa-solid fa-envelope"></i>
                                        </a>

                                        {/* Toggle Read/Unread */}
                                        <button
                                            type="button"
                                            onClick={() => markStatus(selectedMsg._id, !selectedMsg.isRead)}
                                            className="adm-btn adm-btn-secondary adm-btn-sm"
                                            title={selectedMsg.isRead ? "Mark as Unread" : "Mark as Read"}
                                        >
                                            <i className={`fa-solid ${selectedMsg.isRead ? 'fa-envelope-open' : 'fa-envelope'}`}></i>
                                        </button>

                                        {/* Archive / Unarchive */}
                                        <button
                                            type="button"
                                            onClick={() => markStatus(selectedMsg._id, undefined, !selectedMsg.isArchived)}
                                            className={`adm-btn adm-btn-sm ${selectedMsg.isArchived ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                                            title={selectedMsg.isArchived ? "Restore to Inbox" : "Move to Archive"}
                                        >
                                            <i className="fa-solid fa-box-archive"></i>
                                        </button>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(selectedMsg._id, selectedMsg.name)}
                                            className="adm-btn adm-btn-danger adm-btn-sm"
                                            title="Delete Message"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                    <div style={{
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        lineHeight: '1.75',
                                        fontSize: '14px',
                                        color: '#f1f5f9',
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                                    }}>
                                        {selectedMsg.message}
                                    </div>

                                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <p style={{ margin: 0 }}>
                                            <i className="fa-solid fa-clock" style={{ marginRight: '6px' }} />
                                            Received: <strong>{new Date(selectedMsg.createdAt).toLocaleString()}</strong>
                                        </p>
                                        {selectedMsg.ipAddress && (
                                            <p style={{ margin: 0 }}>
                                                <i className="fa-solid fa-network-wired" style={{ marginRight: '6px' }} />
                                                Sender IP: {selectedMsg.ipAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text-muted)' }}>
                                Select a feedback message to read.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
