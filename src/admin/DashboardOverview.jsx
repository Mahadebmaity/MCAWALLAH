// src/admin/DashboardOverview.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

export default function DashboardOverview() {
    const { authFetch } = useAuth();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOverview = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/overview');
            if (res.ok) {
                const data = await res.json();
                setOverview(data);
            }
        } catch (err) {
            console.error('Failed to load overview:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--adm-text-muted)' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', marginBottom: '12px' }}></i>
                <p>Loading your Portfolio Overview...</p>
            </div>
        );
    }

    const stats = overview?.stats || {};

    return (
        <div>
            {/* ── Top Metric Cards ── */}
            <div className="adm-stats-grid">
                <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                        <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <div>
                        <div className="adm-stat-number">{stats.projects?.total || 0}</div>
                        <div className="adm-stat-label">Projects ({stats.projects?.public || 0} Public)</div>
                    </div>
                </div>

                <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <i className="fa-solid fa-microchip"></i>
                    </div>
                    <div>
                        <div className="adm-stat-number">{stats.skills?.total || 0}</div>
                        <div className="adm-stat-label">Skills ({stats.skills?.public || 0} Public)</div>
                    </div>
                </div>

                <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <i className="fa-solid fa-gamepad"></i>
                    </div>
                    <div>
                        <div className="adm-stat-number">{stats.games?.total || 0}</div>
                        <div className="adm-stat-label">Playable Games</div>
                    </div>
                </div>

                <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(232, 69, 69, 0.15)', color: '#e84545' }}>
                        <i className="fa-solid fa-inbox"></i>
                    </div>
                    <div>
                        <div className="adm-stat-number">{stats.messages?.total || 0}</div>
                        <div className="adm-stat-label">{stats.messages?.unread || 0} Unread Feedback</div>
                    </div>
                </div>
            </div>

            {/* ── Quick Action Tiles & Recent Activity ── */}
            <div className="adm-grid-2">
                <div className="adm-card">
                    <div className="adm-card-header">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-bolt" style={{ color: 'var(--adm-warning)' }}></i>
                            Quick Management Actions
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <Link to="/admin/projects" className="adm-btn adm-btn-secondary" style={{ justifyContent: 'center' }}>
                            <i className="fa-solid fa-plus"></i> Add New Project
                        </Link>
                        <Link to="/admin/skills" className="adm-btn adm-btn-secondary" style={{ justifyContent: 'center' }}>
                            <i className="fa-solid fa-plus"></i> Add New Skill
                        </Link>
                        <Link to="/admin/hero" className="adm-btn adm-btn-secondary" style={{ justifyContent: 'center' }}>
                            <i className="fa-solid fa-pen-to-square"></i> Edit Hero &amp; Roles
                        </Link>
                        <Link to="/admin/games" className="adm-btn adm-btn-secondary" style={{ justifyContent: 'center' }}>
                            <i className="fa-solid fa-gamepad"></i> Manage Games
                        </Link>
                    </div>
                </div>

                <div className="adm-card">
                    <div className="adm-card-header">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-inbox" style={{ color: 'var(--adm-primary)' }}></i>
                            Recent Feedback Messages
                        </h3>
                        <Link to="/admin/messages" className="adm-btn adm-btn-sm adm-btn-secondary">
                            View All
                        </Link>
                    </div>

                    {overview?.recentMessages?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {overview.recentMessages.map((msg) => (
                                <div
                                    key={msg._id}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--adm-surface-2)',
                                        borderRadius: '8px',
                                        borderLeft: msg.isRead ? '3px solid #64748b' : '3px solid var(--adm-primary)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <strong style={{ color: 'var(--adm-text-main)', fontSize: '14px' }}>{msg.name}</strong>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                            {msg.subject}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--adm-text-muted)', fontSize: '13px', margin: 0 }}>
                            No feedback messages received yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
