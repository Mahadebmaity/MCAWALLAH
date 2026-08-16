import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function UsersActivityCMS() {
    const { authFetch, user: currentAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'activity'
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Users state
    const [usersData, setUsersData] = useState({
        users: [],
        totalUsers: 0,
        totalAdmins: 0,
        newThisWeek: 0,
        activeToday: 0
    });
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');

    // Activity Logs state
    const [activityData, setActivityData] = useState({
        logs: [],
        totalEvents: 0,
        stats: {
            totalSignups: 0,
            totalLogins: 0,
            totalClicks: 0,
            totalGames: 0
        }
    });
    const [activitySearch, setActivitySearch] = useState('');
    const [activityCategory, setActivityCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllData = async () => {
        setRefreshing(true);
        try {
            const [usersRes, activityRes] = await Promise.all([
                authFetch(`${API_BASE}/admin/users`),
                authFetch(`${API_BASE}/admin/activity-logs?limit=200`)
            ]);

            if (usersRes.ok) {
                const uJson = await usersRes.json();
                setUsersData(uJson);
            }

            if (activityRes.ok) {
                const aJson = await activityRes.json();
                setActivityData(aJson);
            }
        } catch (err) {
            console.error('Failed to load user and activity data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Change User Role
    const handleRoleChange = async (userId, userName, newRole) => {
        if (!window.confirm(`Change role for "${userName}" to ${newRole.toUpperCase()}?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Role Updated 👑',
                    message: `${userName} is now an ${newRole.toUpperCase()}.`
                });
                fetchAllData();
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update role');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Role Update Error',
                message: err.message
            });
        }
    };

    // Delete User
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user account "${userName}"? This cannot be undone.`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'User Deleted 🗑️',
                    message: `Account for ${userName} has been removed.`
                });
                fetchAllData();
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to delete user');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Delete Error',
                message: err.message
            });
        }
    };

    // Clear Activity Logs
    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to clear all recorded activity logs?')) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/activity-logs/clear`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Logs Cleared 🧹',
                    message: 'Activity history has been emptied.'
                });
                fetchAllData();
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Clear Error',
                message: err.message
            });
        }
    };

    // Filter Users
    const filteredUsers = (usersData.users || []).filter(u => {
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase());
        return matchesRole && matchesSearch;
    });

    // Filter Activity Logs
    const filteredLogs = (activityData.logs || []).filter(log => {
        const matchesCat = activityCategory === 'all' || log.category === activityCategory;
        const searchLower = activitySearch.toLowerCase();
        const matchesSearch = (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
            (log.userEmail && log.userEmail.toLowerCase().includes(searchLower)) ||
            (log.action && log.action.toLowerCase().includes(searchLower)) ||
            (log.details && log.details.toLowerCase().includes(searchLower));
        return matchesCat && matchesSearch;
    });

    // Action badge helper
    const getActionBadgeStyle = (category, action) => {
        switch (category) {
            case 'auth':
                return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', icon: 'fa-solid fa-user-shield' };
            case 'game':
                return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', icon: 'fa-solid fa-gamepad' };
            case 'cta':
                return { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', icon: 'fa-solid fa-bolt' };
            case 'document':
                return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: 'fa-solid fa-file-arrow-down' };
            case 'contact':
                return { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', icon: 'fa-solid fa-paper-plane' };
            default:
                return { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', icon: 'fa-solid fa-circle-dot' };
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Users &amp; Activity Telemetry...</div>;

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* ══ Spotlight Header ══ */}
            <div className="adm-card" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
                            <i className="fa-solid fa-satellite-dish" style={{ animation: 'pulse 1.5s infinite' }} /> Real-Time Telemetry &amp; Directory
                        </span>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0' }}>
                            Users &amp; Workflow Activity Tracker
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: '1.5' }}>
                            Track registered users, active sessions, and observe real-time user workflow records (button clicks, resume downloads, game plays, and contact inquiries).
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={fetchAllData}
                            className="adm-btn adm-btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            disabled={refreshing}
                        >
                            <i className={`fa-solid fa-rotate ${refreshing ? 'fa-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh Live Feed'}
                        </button>
                    </div>
                </div>

                {/* Main View Switcher Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: activeTab === 'users' ? 'var(--adm-primary, #38bdf8)' : 'rgba(255, 255, 255, 0.06)',
                            color: activeTab === 'users' ? '#090d16' : '#fff',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fa-solid fa-users" /> Registered Users ({usersData.totalUsers})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('activity')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: activeTab === 'activity' ? 'var(--adm-primary, #38bdf8)' : 'rgba(255, 255, 255, 0.06)',
                            color: activeTab === 'activity' ? '#090d16' : '#fff',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fa-solid fa-list-check" /> Live Activity &amp; Workflow Stream ({activityData.totalEvents})
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 TAB 1: REGISTERED USERS DIRECTORY
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
                <div>
                    {/* KPI Stat Cards */}
                    <div className="adm-grid-4" style={{ marginBottom: '20px' }}>
                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                <i className="fa-solid fa-users" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{usersData.totalUsers}</h3>
                                <p className="adm-stat-label">Total Registered Users</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                                <i className="fa-solid fa-user-shield" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{usersData.totalAdmins}</h3>
                                <p className="adm-stat-label">Administrators</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                <i className="fa-solid fa-bolt" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{usersData.activeToday || 1}</h3>
                                <p className="adm-stat-label">Active Users (Today)</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                                <i className="fa-solid fa-user-plus" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{usersData.newThisWeek}</h3>
                                <p className="adm-stat-label">New Signups (7 Days)</p>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                            <h3 className="adm-card-title" style={{ margin: 0 }}>
                                <i className="fa-solid fa-address-book" style={{ color: 'var(--adm-primary)' }} />
                                User Accounts Directory ({filteredUsers.length})
                            </h3>

                            {/* Search & Filters */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', width: '220px' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', fontSize: '12px' }} />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Search user / email..."
                                        style={{ paddingLeft: '30px', height: '36px', fontSize: '12px' }}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="adm-select"
                                    style={{ width: '130px', height: '36px', fontSize: '12px', padding: '4px 8px' }}
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins Only</option>
                                    <option value="user">Users Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Total Logins</th>
                                        <th>Registered Date</th>
                                        <th>Last Active</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => {
                                            const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                            const isSelf = currentAdmin?._id === u._id;
                                            return (
                                                <tr key={u._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                                                border: '1.5px solid var(--adm-primary)',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                {u.avatar ? (
                                                                    <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8' }}>{initials}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <strong style={{ fontSize: '13.5px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {u.name}
                                                                    {isSelf && <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px' }}>YOU</span>}
                                                                </strong>
                                                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>{u.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            background: u.role === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: u.role === 'admin' ? '#38bdf8' : '#34d399',
                                                            border: `1px solid ${u.role === 'admin' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                                        }}>
                                                            {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                                                            {u.loginCount || 1} logins
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                            {u.role === 'user' ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRoleChange(u._id, u.name, 'admin')}
                                                                    className="adm-btn adm-btn-sm adm-btn-secondary"
                                                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                    title="Make Administrator"
                                                                >
                                                                    <i className="fa-solid fa-crown" style={{ color: '#f59e0b' }} /> Promote
                                                                </button>
                                                            ) : (
                                                                !isSelf && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRoleChange(u._id, u.name, 'user')}
                                                                        className="adm-btn adm-btn-sm adm-btn-secondary"
                                                                        style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                        title="Demote to Regular User"
                                                                    >
                                                                        Demote
                                                                    </button>
                                                                )
                                                            )}

                                                            {!isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                                    className="adm-btn adm-btn-sm adm-btn-danger"
                                                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                    title="Delete User"
                                                                >
                                                                    <i className="fa-solid fa-trash" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                                                No users matching "{userSearch}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                 TAB 2: LIVE ACTIVITY & WORKFLOW TELEMETRY STREAM
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'activity' && (
                <div>
                    {/* Activity KPI Cards */}
                    <div className="adm-grid-4" style={{ marginBottom: '20px' }}>
                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                <i className="fa-solid fa-list-check" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{activityData.totalEvents}</h3>
                                <p className="adm-stat-label">Total Tracked Actions</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                <i className="fa-solid fa-user-check" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{activityData.stats.totalLogins}</h3>
                                <p className="adm-stat-label">User Logins</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                                <i className="fa-solid fa-gamepad" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{activityData.stats.totalGames}</h3>
                                <p className="adm-stat-label">Game Plays</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                                <i className="fa-solid fa-bolt" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{activityData.stats.totalClicks}</h3>
                                <p className="adm-stat-label">Button &amp; CTA Clicks</p>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                            <div>
                                <h3 className="adm-card-title" style={{ margin: 0 }}>
                                    <i className="fa-solid fa-stream" style={{ color: 'var(--adm-primary)' }} />
                                    Live User Workflow Feed ({filteredLogs.length})
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '4px 0 0' }}>
                                    Real-time audit log showing exact buttons clicked, games played, and pages navigated.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleClearLogs}
                                    className="adm-btn adm-btn-secondary adm-btn-sm"
                                    style={{ fontSize: '11px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                                >
                                    <i className="fa-solid fa-trash" /> Clear History
                                </button>
                            </div>
                        </div>

                        {/* Search & Category Filter Pills */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                                {[
                                    { key: 'all', label: 'All Actions' },
                                    { key: 'auth', label: '🔐 Signups & Logins' },
                                    { key: 'cta', label: '⚡ Button Clicks' },
                                    { key: 'game', label: '🎮 Arcade Games' },
                                    { key: 'document', label: '📄 Resume & Docs' },
                                    { key: 'contact', label: '💬 Inquiries' }
                                ].map(cat => (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => setActivityCategory(cat.key)}
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: '999px',
                                            border: 'none',
                                            fontSize: '11.5px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            background: activityCategory === cat.key ? 'var(--adm-primary)' : 'rgba(255, 255, 255, 0.05)',
                                            color: activityCategory === cat.key ? '#090d16' : '#cbd5e1'
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ position: 'relative', width: '220px' }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', fontSize: '12px' }} />
                                <input
                                    type="text"
                                    className="adm-input"
                                    placeholder="Filter by user / action..."
                                    style={{ paddingLeft: '30px', height: '34px', fontSize: '12px' }}
                                    value={activitySearch}
                                    onChange={(e) => setActivitySearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Event Feed List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => {
                                    const badge = getActionBadgeStyle(log.category, log.action);
                                    return (
                                        <div
                                            key={log._id}
                                            style={{
                                                background: 'var(--adm-surface-2)',
                                                border: '1px solid var(--adm-border)',
                                                borderRadius: '10px',
                                                padding: '12px 16px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '12px',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    flexShrink: 0
                                                }}>
                                                    <i className={badge.icon} />
                                                </div>

                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase',
                                                            background: badge.bg,
                                                            color: badge.color,
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {log.action}
                                                        </span>
                                                        <strong style={{ fontSize: '13.5px', color: '#f1f5f9' }}>
                                                            {log.details || log.action}
                                                        </strong>
                                                    </div>

                                                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                        <span>
                                                            <i className="fa-solid fa-user" style={{ fontSize: '10px', marginRight: '4px' }} />
                                                            {log.userName} {log.userEmail ? `(${log.userEmail})` : ''}
                                                        </span>
                                                        {log.path && (
                                                            <span>
                                                                <i className="fa-solid fa-route" style={{ fontSize: '10px', marginRight: '4px' }} />
                                                                {log.path}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b' }}>
                                                <div style={{ fontWeight: '600', color: '#94a3b8' }}>
                                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                                <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)', fontSize: '13px' }}>
                                    <i className="fa-solid fa-satellite" style={{ fontSize: '28px', opacity: 0.4, marginBottom: '10px', display: 'block' }} />
                                    No activity logs in "{activityCategory}".
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
