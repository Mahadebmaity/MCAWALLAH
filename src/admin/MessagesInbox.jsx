import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import './admin.css';

export default function MessagesInbox() {
    const { authFetch } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'archived'

    const fetchMessages = async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/section/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                if (data.length > 0 && !selectedMsg) {
                    setSelectedMsg(data[0]);
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
                const updated = await res.json();
                setMessages(prev => prev.map(m => m._id === id ? updated : m));
                if (selectedMsg?._id === id) {
                    setSelectedMsg(updated);
                }
            }
        } catch (err) {
            console.error('Status update failed:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message permanently?')) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/section/messages/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const filtered = messages.filter(m => m._id !== id);
                setMessages(filtered);
                setSelectedMsg(filtered[0] || null);
            }
        } catch (err) {
            console.error('Delete message error:', err);
        }
    };

    const selectMessage = (msg) => {
        setSelectedMsg(msg);
        if (!msg.isRead) {
            markStatus(msg._id, true);
        }
    };

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.isRead && !m.isArchived;
        if (filter === 'archived') return m.isArchived;
        return !m.isArchived;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Feedback Messages...</div>;

    return (
        <div>
            <div className="adm-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="adm-inbox-split" style={{ display: 'flex', minHeight: '600px' }}>
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
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Inbox Messages</h3>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                    {messages.filter(m => !m.isRead).length} Unread
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
                                            fontWeight: '600'
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
                                            borderLeft: !msg.isRead ? '3px solid var(--adm-primary)' : '3px solid transparent'
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
                                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8', fontWeight: msg.isRead ? '400' : '600' }}>
                                            {msg.subject}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.message}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--adm-text-muted)', fontSize: '13px' }}>
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
                                    padding: '20px',
                                    borderBottom: '1px solid var(--adm-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--adm-text-main)' }}>{selectedMsg.subject}</h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                            From: <strong style={{ color: 'var(--adm-text-main)' }}>{selectedMsg.name}</strong> &lt;{selectedMsg.email}&gt;
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a
                                            href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                                            className="adm-btn adm-btn-primary adm-btn-sm"
                                        >
                                            <i className="fa-solid fa-reply"></i> Reply via Email
                                        </a>
                                        <button
                                            onClick={() => markStatus(selectedMsg._id, !selectedMsg.isRead)}
                                            className="adm-btn adm-btn-secondary adm-btn-sm"
                                            title="Toggle Read/Unread"
                                        >
                                            <i className={`fa-solid ${selectedMsg.isRead ? 'fa-envelope-open' : 'fa-envelope'}`}></i>
                                        </button>
                                        <button
                                            onClick={() => markStatus(selectedMsg._id, undefined, !selectedMsg.isArchived)}
                                            className="adm-btn adm-btn-secondary adm-btn-sm"
                                            title="Archive"
                                        >
                                            <i className="fa-solid fa-box-archive"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedMsg._id)}
                                            className="adm-btn adm-btn-danger adm-btn-sm"
                                            title="Delete"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                    <div style={{
                                        background: 'var(--adm-surface-2)',
                                        border: '1px solid var(--adm-border)',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        lineHeight: '1.7',
                                        fontSize: '14px',
                                        color: '#f1f5f9',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedMsg.message}
                                    </div>

                                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
                                        <p style={{ margin: '4px 0' }}>Received: {new Date(selectedMsg.createdAt).toLocaleString()}</p>
                                        {selectedMsg.ipAddress && <p style={{ margin: '4px 0' }}>Sender IP: {selectedMsg.ipAddress}</p>}
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
