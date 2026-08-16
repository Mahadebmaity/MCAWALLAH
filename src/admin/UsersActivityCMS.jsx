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

    // Message to User Modal state
    const [messageModalUser, setMessageModalUser] = useState(null);
    const [msgSubject, setMsgSubject] = useState('');
    const [msgBody, setMsgBody] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Reset Password Modal state
    const [resetPwModalUser, setResetPwModalUser] = useState(null);
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [resettingPw, setResettingPw] = useState(false);

    // User Activity History Drawer state
    const [historyModalUser, setHistoryModalUser] = useState(null);
    const [userHistoryData, setUserHistoryData] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

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

    // Toggle User Suspension (Ban / Activate)
    const handleToggleSuspension = async (userId, userName, currentSuspended) => {
        const nextState = !currentSuspended;
        if (!window.confirm(`${nextState ? 'Suspend / Block' : 'Reactivate'} access for "${userName}"?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isSuspended: nextState })
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: nextState ? 'User Suspended 🚫' : 'User Reactivated ✅',
                    message: `${userName} account access has been ${nextState ? 'suspended' : 'reactivated'}.`
                });
                fetchAllData();
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update user status');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Status Update Error',
                message: err.message
            });
        }
    };

    // Admin Reset User Password
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!newPasswordInput || newPasswordInput.length < 6) {
            setToast({
                type: 'error',
                title: 'Invalid Password',
                message: 'Password must be at least 6 characters.'
            });
            return;
        }

        setResettingPw(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/users/${resetPwModalUser._id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: newPasswordInput })
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Password Reset! 🔑',
                    message: `Password for ${resetPwModalUser.name} has been updated.`
                });
                setResetPwModalUser(null);
                setNewPasswordInput('');
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to reset password');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Password Reset Error',
                message: err.message
            });
        } finally {
            setResettingPw(false);
        }
    };

    // Open User History
    const handleOpenHistory = async (user) => {
        setHistoryModalUser(user);
        setLoadingHistory(true);
        setUserHistoryData(null);
        try {
            const res = await authFetch(`${API_BASE}/admin/users/${user._id}/activity`);
            if (res.ok) {
                const json = await res.json();
                setUserHistoryData(json);
            }
        } catch (err) {
            console.error('Failed to load user history:', err);
        } finally {
            setLoadingHistory(false);
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

    // Open Message Modal
    const handleOpenMessageModal = (user) => {
        setMessageModalUser(user);
        setMsgSubject(`Message from Admin - ${currentAdmin?.name || 'Mahadeb Maity'}`);
        setMsgBody(`Hi ${user.name},\n\nHope you are enjoying the portfolio!\n\nBest regards,\nMahadeb Maity`);
    };

    const handleCopyEmail = (emailStr) => {
        if (!emailStr) return;
        navigator.clipboard.writeText(emailStr);
        setCopiedEmail(true);
        setToast({
            type: 'success',
            title: 'Email Copied 📋',
            message: `${emailStr} copied to clipboard.`
        });
        setTimeout(() => setCopiedEmail(false), 3000);
    };

    // Filter Users
    const filteredUsers = (usersData.users || []).filter(u => {
        const matchesRole = userRoleFilter === 'all' ||
            (userRoleFilter === 'admin' && u.role === 'admin') ||
            (userRoleFilter === 'user' && u.role === 'user') ||
            (userRoleFilter === 'suspended' && u.isSuspended);
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

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading User Management Studio...</div>;

    const gmailComposeUrl = messageModalUser
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(messageModalUser.email)}&su=${encodeURIComponent(msgSubject)}&body=${encodeURIComponent(msgBody)}`
        : '#';

    const mailtoUrl = messageModalUser
        ? `mailto:${messageModalUser.email}?subject=${encodeURIComponent(msgSubject)}&body=${encodeURIComponent(msgBody)}`
        : '#';

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
                            <i className="fa-solid fa-users-gear" /> User Control Center &amp; Live Telemetry
                        </span>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0' }}>
                            User Management Studio
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: '1.5' }}>
                            View who has signed up &amp; logged in, control user permissions, send direct email messages, reset passwords, and track real-time workflows.
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
                            {refreshing ? 'Refreshing...' : 'Refresh'}
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
                        <i className="fa-solid fa-users-gear" /> Registered Users ({usersData.totalUsers})
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
                        <i className="fa-solid fa-list-check" /> Live Workflow Stream ({activityData.totalEvents})
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 TAB 1: USER MANAGEMENT DIRECTORY & ACTIONS
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
                                <p className="adm-stat-label">Total Users</p>
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
                                User Directory &amp; Permissions ({filteredUsers.length})
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
                                    style={{ width: '140px', height: '36px', fontSize: '12px', padding: '4px 8px' }}
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Accounts</option>
                                    <option value="admin">Admins Only</option>
                                    <option value="user">Users Only</option>
                                    <option value="suspended">Suspended Users</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>User Profile</th>
                                        <th>Role / Status</th>
                                        <th>Logins</th>
                                        <th>Registered Date</th>
                                        <th>Last Active</th>
                                        <th style={{ textAlign: 'right' }}>Admin Controls &amp; Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => {
                                            const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                            const isSelf = currentAdmin?._id === u._id;
                                            return (
                                                <tr key={u._id} style={{ opacity: u.isSuspended ? 0.65 : 1 }}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                                                border: u.isSuspended ? '2px solid #ef4444' : '2px solid var(--adm-primary)',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                {u.avatar ? (
                                                                    <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>{initials}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <strong style={{ fontSize: '14px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {u.name}
                                                                    {isSelf && <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px' }}>YOU</span>}
                                                                    {u.isSuspended && <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px' }}>SUSPENDED</span>}
                                                                </strong>
                                                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>{u.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase',
                                                                padding: '2px 6px',
                                                                borderRadius: '6px',
                                                                width: 'max-content',
                                                                background: u.role === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                                color: u.role === 'admin' ? '#38bdf8' : '#34d399',
                                                                border: `1px solid ${u.role === 'admin' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                                            }}>
                                                                {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                                            </span>
                                                        </div>
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
                                                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                                            {/* ✉️ Send Direct Message */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenMessageModal(u)}
                                                                className="adm-btn adm-btn-sm adm-btn-primary"
                                                                style={{ fontSize: '11px', padding: '4px 9px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                title="Send direct email / message to this user"
                                                            >
                                                                <i className="fa-solid fa-paper-plane" /> Message
                                                            </button>

                                                            {/* 🔍 View Activity History */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenHistory(u)}
                                                                className="adm-btn adm-btn-sm adm-btn-secondary"
                                                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                title="View user activity history &amp; scores"
                                                            >
                                                                <i className="fa-solid fa-chart-line" />
                                                            </button>

                                                            {/* 🔑 Reset Password */}
                                                            <button
                                                                type="button"
                                                                onClick={() => { setResetPwModalUser(u); setNewPasswordInput(''); }}
                                                                className="adm-btn adm-btn-sm adm-btn-secondary"
                                                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                title="Reset user's password"
                                                            >
                                                                <i className="fa-solid fa-key" />
                                                            </button>

                                                            {/* 👑 Role Changer */}
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

                                                            {/* 🚫 Suspend / Activate Toggle */}
                                                            {!isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleSuspension(u._id, u.name, u.isSuspended)}
                                                                    className={`adm-btn adm-btn-sm ${u.isSuspended ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                                                                    style={{ fontSize: '11px', padding: '4px 8px', color: u.isSuspended ? '#090d16' : '#f87171' }}
                                                                    title={u.isSuspended ? "Reactivate user account" : "Suspend user account"}
                                                                >
                                                                    <i className={`fa-solid ${u.isSuspended ? 'fa-unlock' : 'fa-ban'}`} />
                                                                </button>
                                                            )}

                                                            {/* 🗑️ Delete User */}
                                                            {!isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                                    className="adm-btn adm-btn-sm adm-btn-danger"
                                                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                    title="Delete User permanently"
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
                                                No users found.
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
                 TAB 2: LIVE WORKFLOW STREAM
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
                                <p className="adm-stat-label">Total Actions</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                <i className="fa-solid fa-user-check" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{activityData.stats.totalLogins}</h3>
                                <p className="adm-stat-label">Logins</p>
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
                                <p className="adm-stat-label">Button Clicks</p>
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
                                                gap: '12px'
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

            {/* ══════════════════════════════════════════════════════════════
                 MODAL 1: SEND DIRECT MESSAGE / EMAIL TO USER
            ══════════════════════════════════════════════════════════════ */}
            {messageModalUser && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="adm-card" style={{ width: '100%', maxWidth: '540px', padding: '24px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--adm-primary)' }} />
                                Message to {messageModalUser.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setMessageModalUser(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '18px' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>Recipient Email:</span>
                                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#38bdf8' }}>{messageModalUser.email}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopyEmail(messageModalUser.email)}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                                style={{ fontSize: '11px' }}
                            >
                                <i className={`fa-solid ${copiedEmail ? 'fa-check' : 'fa-copy'}`} />
                                {copiedEmail ? 'Copied' : 'Copy Email'}
                            </button>
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Subject</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={msgSubject}
                                onChange={(e) => setMsgSubject(e.target.value)}
                            />
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Message Body</label>
                            <textarea
                                className="adm-textarea"
                                rows={5}
                                value={msgBody}
                                onChange={(e) => setMsgBody(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                            <a
                                href={gmailComposeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="adm-btn adm-btn-primary"
                                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                                onClick={() => setMessageModalUser(null)}
                            >
                                <i className="fa-solid fa-envelope-open-text" /> Send via Web Gmail
                            </a>

                            <a
                                href={mailtoUrl}
                                className="adm-btn adm-btn-secondary"
                                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                                onClick={() => setMessageModalUser(null)}
                            >
                                <i className="fa-solid fa-paper-plane" /> Default Email App
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                 MODAL 2: RESET USER PASSWORD
            ══════════════════════════════════════════════════════════════ */}
            {resetPwModalUser && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <form onSubmit={handleResetPasswordSubmit} className="adm-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-key" style={{ color: '#ec4899' }} />
                                Reset Password for {resetPwModalUser.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setResetPwModalUser(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '18px' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
                            Set a new login password for <strong>{resetPwModalUser.email}</strong>.
                        </p>

                        <div className="adm-form-group">
                            <label className="adm-label">New Password (min 6 chars)</label>
                            <input
                                type="password"
                                className="adm-input"
                                placeholder="Enter new password"
                                required
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                            <button
                                type="button"
                                onClick={() => setResetPwModalUser(null)}
                                className="adm-btn adm-btn-secondary"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={resettingPw}
                                className="adm-btn adm-btn-primary"
                                style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', borderColor: 'transparent' }}
                            >
                                {resettingPw ? 'Saving...' : 'Set Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                 MODAL 3: USER ACTIVITY & HISTORY DRAWER
            ══════════════════════════════════════════════════════════════ */}
            {historyModalUser && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '520px',
                        height: '100%',
                        background: 'var(--adm-surface)',
                        borderLeft: '1px solid var(--adm-border)',
                        padding: '24px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--adm-border)' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#fff' }}>{historyModalUser.name}'s History</h3>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>{historyModalUser.email}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHistoryModalUser(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '20px' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--adm-text-muted)' }}>
                                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }} />
                                <div>Loading history...</div>
                            </div>
                        ) : userHistoryData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {/* User Meta Card */}
                                <div style={{ background: 'var(--adm-surface-2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--adm-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                        <div>Total Logins: <strong>{userHistoryData.user.loginCount || 1}</strong></div>
                                        <div>Role: <strong>{userHistoryData.user.role.toUpperCase()}</strong></div>
                                        <div>Joined: <strong>{new Date(userHistoryData.user.createdAt).toLocaleDateString()}</strong></div>
                                        <div>Last Active: <strong>{userHistoryData.user.lastLogin ? new Date(userHistoryData.user.lastLogin).toLocaleTimeString() : 'N/A'}</strong></div>
                                    </div>
                                </div>

                                {/* Game Scores Recorded */}
                                {userHistoryData.gameScores?.length > 0 && (
                                    <div>
                                        <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#c084fc' }}>
                                            <i className="fa-solid fa-gamepad" style={{ marginRight: '6px' }} /> Game Scores
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {userHistoryData.gameScores.map(score => (
                                                <div key={score._id} style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                    <span><strong>{score.gameSlug.toUpperCase()}</strong> - Score: {score.score} pts</span>
                                                    <span style={{ color: '#94a3b8' }}>{new Date(score.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Activity Events Feed */}
                                <div>
                                    <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#38bdf8' }}>
                                        <i className="fa-solid fa-timeline" style={{ marginRight: '6px' }} /> Recent Activity Events
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {userHistoryData.activity?.length > 0 ? (
                                            userHistoryData.activity.map(act => (
                                                <div key={act._id} style={{ background: 'var(--adm-surface-2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--adm-border)', fontSize: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                        <span style={{ fontWeight: '700', color: '#f1f5f9' }}>{act.action}</span>
                                                        <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(act.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ color: '#94a3b8' }}>{act.details || act.action}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--adm-text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                                No recorded activity events for this user.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
