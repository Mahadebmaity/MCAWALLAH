// src/admin/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import './admin.css';

const NAV_ITEMS = [
    { to: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'Dashboard' },
    { to: '/admin/users-activity', icon: 'fa-solid fa-users-gear', label: 'User Management' },
    { to: '/admin/navbar', icon: 'fa-solid fa-compass', label: 'Navbar & Menu' },
    { to: '/admin/hero', icon: 'fa-solid fa-wand-magic-sparkles', label: 'Hero & Header' },
    { to: '/admin/moments', icon: 'fa-solid fa-images', label: 'Moments Gallery' },
    { to: '/admin/about', icon: 'fa-solid fa-circle-user', label: 'About Me' },
    { to: '/admin/skills', icon: 'fa-solid fa-microchip', label: 'Skills' },
    { to: '/admin/timeline', icon: 'fa-solid fa-timeline', label: 'Experience & Edu' },
    { to: '/admin/projects', icon: 'fa-solid fa-folder-open', label: 'Projects' },
    { to: '/admin/playground', icon: 'fa-solid fa-laptop-code', label: 'Playground CMS' },
    { to: '/admin/games', icon: 'fa-solid fa-gamepad', label: 'Games Hub' },
    { to: '/admin/docs', icon: 'fa-solid fa-file-shield', label: 'Docs & System Vault' },
    { to: '/admin/plans', icon: 'fa-solid fa-list-check', label: 'Feature Plans & Specs' },
    { to: '/admin/command-palette', icon: 'fa-solid fa-terminal', label: 'Command Palette CMS' },
    { to: '/admin/ai-assistant', icon: 'fa-solid fa-robot', label: 'AI Assistant CMS' },
    { to: '/admin/messages', icon: 'fa-solid fa-inbox', label: 'Feedback Inbox' },
    { to: '/admin/footer', icon: 'fa-solid fa-envelope-open-text', label: 'Footer & Subscribers' },
    { to: '/admin/settings', icon: 'fa-solid fa-sliders', label: 'Settings & Backup' }
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch unread count for badge
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;
                const res = await fetch(`${API_BASE}/admin/overview`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setUnreadCount(json.stats?.messages?.unread || 0);
                }
            } catch {}
        };
        fetchStats();
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const getPageTitle = () => {
        const item = NAV_ITEMS.find(n => n.to === location.pathname);
        return item ? item.label : 'Admin Studio';
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MM';

    return (
        <div className="adm-layout">
            {/* ── Sidebar ── */}
            <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="adm-brand">
                    <div className="adm-brand-logo">
                        <i className="fa-solid fa-terminal" style={{ color: 'var(--adm-primary)' }}></i>
                        <span>Mahadeb CMS</span>
                    </div>
                    <span className="adm-brand-badge">v2.0</span>
                </div>

                <nav className="adm-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {item.to === '/admin/messages' && unreadCount > 0 && (
                                <span className="adm-nav-badge">{unreadCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="adm-user-footer">
                    <div className="adm-user-info">
                        <div className="adm-user-avatar">{initials}</div>
                        <div className="adm-user-meta">
                            <p>{user?.name || 'Mahadeb Maity'}</p>
                            <span>{user?.email || 'admin@portfolio.com'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        title="Sign Out"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="adm-backdrop" onClick={() => setSidebarOpen(false)} />}

            {/* ── Main Canvas ── */}
            <div className="adm-main">
                <header className="adm-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            className="adm-btn adm-btn-sm adm-btn-secondary adm-hamburger"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle Sidebar"
                        >
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <h2 className="adm-page-title">{getPageTitle()}</h2>
                    </div>

                    <div className="adm-topbar-actions">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            View Live Portfolio
                        </a>
                    </div>
                </header>

                <main className="adm-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
