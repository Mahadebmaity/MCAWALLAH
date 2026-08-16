import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function FooterSubscribersCMS() {
    const { authFetch } = useAuth();
    const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' | 'footer'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Subscribers State
    const [subscribersData, setSubscribersData] = useState({
        subscribers: [],
        totalSubscribers: 0,
        activeCount: 0,
        unsubscribedCount: 0
    });
    const [subSearch, setSubSearch] = useState('');
    const [subStatusFilter, setSubStatusFilter] = useState('all');

    // Message / Email to Subscriber Modal
    const [emailModalSub, setEmailModalSub] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Footer Form State
    const [footerForm, setFooterForm] = useState({
        isPublic: true,
        brandName: 'Mahadeb',
        brandPrefix: '<',
        brandSuffix: '/>',
        bio: 'Building beautiful, performant web experiences that users love. Passionate about clean code, great design, and meaningful products.',
        contactEmail: 'you@email.com',
        contactPhone: '+91 12345 67890',
        contactLocation: 'Haldia, West Bengal, India',
        newsletterTitle: 'NEWSLETTER',
        newsletterSubtitle: 'Get updates on new projects and articles. No spam, ever.',
        newsletterButtonText: 'Subscribe',
        copyrightText: 'Mahadeb Maity. Built with React & Node.js',
        showNewsletter: true,
        showSocials: true,
        showQuickLinks: true,
        showContactInfo: true,
        quickLinks: [
            { label: 'Home', href: '#home', isVisible: true },
            { label: 'About', href: '#about', isVisible: true },
            { label: 'Projects', href: '#projects', isVisible: true },
            { label: 'Fun Game', href: '#fun-game', isVisible: true },
            { label: 'Contact', href: '#contact', isVisible: true },
            { label: 'Privacy Policy', href: '#privacy', isVisible: true }
        ],
        socials: [
            { label: 'GitHub', icon: 'fa-brands fa-github', href: 'https://github.com', color: '#333', isVisible: true },
            { label: 'LinkedIn', icon: 'fa-brands fa-linkedin', href: 'https://linkedin.com', color: '#0A66C2', isVisible: true },
            { label: 'Twitter', icon: 'fa-brands fa-twitter', href: 'https://twitter.com', color: '#1DA1F2', isVisible: true },
            { label: 'Instagram', icon: 'fa-brands fa-instagram', href: 'https://instagram.com', color: '#E1306C', isVisible: true },
            { label: 'Facebook', icon: 'fa-brands fa-facebook', href: 'https://facebook.com', color: '#1877F2', isVisible: true }
        ]
    });

    const fetchData = async () => {
        try {
            const [subsRes, footerRes] = await Promise.all([
                authFetch(`${API_BASE}/admin/subscribers`),
                authFetch(`${API_BASE}/admin/footer`)
            ]);

            if (subsRes.ok) {
                const sJson = await subsRes.json();
                setSubscribersData(sJson);
            }

            if (footerRes.ok) {
                const fJson = await footerRes.json();
                if (fJson) {
                    setFooterForm(prev => ({
                        ...prev,
                        ...fJson,
                        quickLinks: fJson.quickLinks?.length > 0 ? fJson.quickLinks : prev.quickLinks,
                        socials: fJson.socials?.length > 0 ? fJson.socials : prev.socials
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to load footer & subscribers data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Save Footer Settings
    const handleSaveFooter = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/footer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(footerForm)
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Footer Updated 🚀',
                    message: 'Footer layout & settings published live!'
                });
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update footer');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    // Toggle Subscriber Status (Active / Unsubscribed)
    const handleToggleSubStatus = async (subId, email, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
        try {
            const res = await authFetch(`${API_BASE}/admin/subscribers/${subId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Status Updated',
                    message: `${email} is now ${nextStatus}.`
                });
                fetchData();
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error',
                message: err.message
            });
        }
    };

    // Delete Subscriber
    const handleDeleteSubscriber = async (subId, email) => {
        if (!window.confirm(`Delete subscriber "${email}"?`)) return;
        try {
            const res = await authFetch(`${API_BASE}/admin/subscribers/${subId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setToast({
                    type: 'success',
                    title: 'Subscriber Deleted 🗑️',
                    message: `Removed ${email} from subscriber list.`
                });
                fetchData();
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Delete Failed',
                message: err.message
            });
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        const subs = subscribersData.subscribers || [];
        if (subs.length === 0) {
            setToast({ type: 'error', title: 'No Subscribers', message: 'No subscribers to export.' });
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Status,Subscribed Date,Device\n"
            + subs.map(s => `"${s.email}","${s.status}","${new Date(s.createdAt).toISOString()}","${(s.device || '').replace(/"/g, '""')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setToast({
            type: 'success',
            title: 'CSV Exported 📥',
            message: `Exported ${subs.length} subscribers.`
        });
    };

    // Copy All Emails
    const handleCopyAllEmails = () => {
        const activeEmails = (subscribersData.subscribers || [])
            .filter(s => s.status === 'active')
            .map(s => s.email)
            .join(', ');

        if (!activeEmails) {
            setToast({ type: 'error', title: 'No Emails', message: 'No active subscribers found.' });
            return;
        }

        navigator.clipboard.writeText(activeEmails);
        setToast({
            type: 'success',
            title: 'Emails Copied 📋',
            message: `Copied ${activeEmails.split(', ').length} active subscriber emails.`
        });
    };

    // Open Email to Subscriber
    const handleOpenEmailModal = (sub) => {
        setEmailModalSub(sub);
        setEmailSubject('Newsletter Update from Mahadeb Maity');
        setEmailBody(`Hi,\n\nThank you for subscribing to my portfolio newsletter! Here is an update on my latest projects and tech articles.\n\nBest regards,\nMahadeb Maity`);
    };

    // Quick Links helpers
    const handleAddQuickLink = () => {
        setFooterForm({
            ...footerForm,
            quickLinks: [...footerForm.quickLinks, { label: 'New Link', href: '#', isVisible: true }]
        });
    };

    const handleUpdateQuickLink = (idx, field, val) => {
        const updated = [...footerForm.quickLinks];
        updated[idx][field] = val;
        setFooterForm({ ...footerForm, quickLinks: updated });
    };

    const handleDeleteQuickLink = (idx) => {
        const updated = footerForm.quickLinks.filter((_, i) => i !== idx);
        setFooterForm({ ...footerForm, quickLinks: updated });
    };

    // Socials helpers
    const handleAddSocial = () => {
        setFooterForm({
            ...footerForm,
            socials: [...footerForm.socials, { label: 'Social', icon: 'fa-brands fa-globe', href: 'https://', color: '#38bdf8', isVisible: true }]
        });
    };

    const handleUpdateSocial = (idx, field, val) => {
        const updated = [...footerForm.socials];
        updated[idx][field] = val;
        setFooterForm({ ...footerForm, socials: updated });
    };

    const handleDeleteSocial = (idx) => {
        const updated = footerForm.socials.filter((_, i) => i !== idx);
        setFooterForm({ ...footerForm, socials: updated });
    };

    // Filter subscribers
    const filteredSubscribers = (subscribersData.subscribers || []).filter(s => {
        const matchesStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
        const matchesSearch = s.email.toLowerCase().includes(subSearch.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Footer &amp; Newsletter CMS...</div>;

    const gmailComposeUrl = emailModalSub
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailModalSub.email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
        : '#';

    return (
        <div>
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
                            <i className="fa-solid fa-envelope-open-text" /> Audience &amp; Footer CMS
                        </span>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '4px 0 8px 0' }}>
                            Footer &amp; Newsletter Subscribers
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: '1.5' }}>
                            Manage your newsletter subscribers, send updates, export email lists, and customize every aspect of your public portfolio footer.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={fetchData}
                            className="adm-btn adm-btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <i className="fa-solid fa-rotate" /> Refresh
                        </button>
                    </div>
                </div>

                {/* View Switcher Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('subscribers')}
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
                            background: activeTab === 'subscribers' ? 'var(--adm-primary, #38bdf8)' : 'rgba(255, 255, 255, 0.06)',
                            color: activeTab === 'subscribers' ? '#090d16' : '#fff',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fa-solid fa-users" /> Newsletter Subscribers ({subscribersData.totalSubscribers})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('footer')}
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
                            background: activeTab === 'footer' ? 'var(--adm-primary, #38bdf8)' : 'rgba(255, 255, 255, 0.06)',
                            color: activeTab === 'footer' ? '#090d16' : '#fff',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fa-solid fa-sliders" /> Footer Content &amp; Customization
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                 TAB 1: NEWSLETTER SUBSCRIBERS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'subscribers' && (
                <div>
                    {/* Subscriber KPIs */}
                    <div className="adm-grid-3" style={{ marginBottom: '20px' }}>
                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                <i className="fa-solid fa-envelope-open-text" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{subscribersData.totalSubscribers}</h3>
                                <p className="adm-stat-label">Total Subscribers</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                <i className="fa-solid fa-circle-check" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{subscribersData.activeCount}</h3>
                                <p className="adm-stat-label">Active Subscribers</p>
                            </div>
                        </div>

                        <div className="adm-stat-card">
                            <div className="adm-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                                <i className="fa-solid fa-user-xmark" />
                            </div>
                            <div className="adm-stat-content">
                                <h3 className="adm-stat-val">{subscribersData.unsubscribedCount}</h3>
                                <p className="adm-stat-label">Unsubscribed</p>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                            <div>
                                <h3 className="adm-card-title" style={{ margin: 0 }}>
                                    <i className="fa-solid fa-address-book" style={{ color: 'var(--adm-primary)' }} />
                                    Subscribers List ({filteredSubscribers.length})
                                </h3>
                            </div>

                            {/* Actions & Filters */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleCopyAllEmails}
                                    className="adm-btn adm-btn-secondary adm-btn-sm"
                                    title="Copy all active subscriber emails to clipboard"
                                >
                                    <i className="fa-solid fa-copy" /> Copy Active Emails
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportCSV}
                                    className="adm-btn adm-btn-secondary adm-btn-sm"
                                    title="Download subscribers as CSV file"
                                >
                                    <i className="fa-solid fa-file-csv" /> Export CSV
                                </button>

                                <div style={{ position: 'relative', width: '200px' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', fontSize: '12px' }} />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Search email..."
                                        style={{ paddingLeft: '30px', height: '34px', fontSize: '12px' }}
                                        value={subSearch}
                                        onChange={(e) => setSubSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="adm-select"
                                    style={{ width: '130px', height: '34px', fontSize: '12px', padding: '4px 8px' }}
                                    value={subStatusFilter}
                                    onChange={(e) => setSubStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active Only</option>
                                    <option value="unsubscribed">Unsubscribed</option>
                                </select>
                            </div>
                        </div>

                        {/* Subscribers Table */}
                        <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>Subscriber Email</th>
                                        <th>Status</th>
                                        <th>Subscribed Date</th>
                                        <th>Device / IP</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscribers.length > 0 ? (
                                        filteredSubscribers.map((sub) => (
                                            <tr key={sub._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className="fa-solid fa-envelope" style={{ color: 'var(--adm-primary)', fontSize: '14px' }} />
                                                        <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>{sub.email}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: sub.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                        color: sub.status === 'active' ? '#34d399' : '#f87171',
                                                        border: `1px solid ${sub.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                                    }}>
                                                        {sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    {new Date(sub.createdAt).toLocaleString()}
                                                </td>
                                                <td style={{ fontSize: '11px', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {sub.device || sub.ip || 'Web Browser'}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEmailModal(sub)}
                                                            className="adm-btn adm-btn-sm adm-btn-primary"
                                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                                            title="Send direct email"
                                                        >
                                                            <i className="fa-solid fa-paper-plane" /> Email
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleSubStatus(sub._id, sub.email, sub.status)}
                                                            className="adm-btn adm-btn-sm adm-btn-secondary"
                                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                                            title={sub.status === 'active' ? 'Mark as Unsubscribed' : 'Reactivate subscription'}
                                                        >
                                                            <i className={`fa-solid ${sub.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}`} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                                                            className="adm-btn adm-btn-sm adm-btn-danger"
                                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                                            title="Delete subscriber permanently"
                                                        >
                                                            <i className="fa-solid fa-trash" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                                                No subscribers found.
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
                 TAB 2: FOOTER CUSTOMIZATION CMS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'footer' && (
                <form onSubmit={handleSaveFooter} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {/* 1. Branding & Bio */}
                    <div className="adm-card">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-signature" style={{ color: 'var(--adm-primary)' }} />
                            Branding &amp; Bio Information
                        </h3>

                        <div className="adm-grid-3" style={{ marginBottom: '16px' }}>
                            <div className="adm-form-group">
                                <label className="adm-label">Prefix (e.g. &lt;)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.brandPrefix}
                                    onChange={(e) => setFooterForm({ ...footerForm, brandPrefix: e.target.value })}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Brand Name</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.brandName}
                                    onChange={(e) => setFooterForm({ ...footerForm, brandName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Suffix (e.g. /&gt;)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.brandSuffix}
                                    onChange={(e) => setFooterForm({ ...footerForm, brandSuffix: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Footer Bio / Description</label>
                            <textarea
                                className="adm-textarea"
                                rows={3}
                                value={footerForm.bio}
                                onChange={(e) => setFooterForm({ ...footerForm, bio: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 2. Contact Information */}
                    <div className="adm-card">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-address-card" style={{ color: 'var(--adm-primary)' }} />
                            Get in Touch (Contact Column)
                        </h3>

                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Contact Email</label>
                                <input
                                    type="email"
                                    className="adm-input"
                                    value={footerForm.contactEmail}
                                    onChange={(e) => setFooterForm({ ...footerForm, contactEmail: e.target.value })}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Contact Phone</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.contactPhone}
                                    onChange={(e) => setFooterForm({ ...footerForm, contactPhone: e.target.value })}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Location / Address</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.contactLocation}
                                    onChange={(e) => setFooterForm({ ...footerForm, contactLocation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Newsletter Box Customizer */}
                    <div className="adm-card">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-envelope-open-text" style={{ color: 'var(--adm-primary)' }} />
                            Newsletter Section Configuration
                        </h3>

                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Heading Title</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.newsletterTitle}
                                    onChange={(e) => setFooterForm({ ...footerForm, newsletterTitle: e.target.value })}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Subtitle Description</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.newsletterSubtitle}
                                    onChange={(e) => setFooterForm({ ...footerForm, newsletterSubtitle: e.target.value })}
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Button Text</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={footerForm.newsletterButtonText}
                                    onChange={(e) => setFooterForm({ ...footerForm, newsletterButtonText: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Social Links List */}
                    <div className="adm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="adm-card-title" style={{ margin: 0 }}>
                                <i className="fa-solid fa-share-nodes" style={{ color: 'var(--adm-primary)' }} />
                                Social Media Links ({footerForm.socials.length})
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddSocial}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                            >
                                <i className="fa-solid fa-plus" /> Add Social Link
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {footerForm.socials.map((soc, idx) => (
                                <div key={idx} className="adm-repeater-row">
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Label (e.g. GitHub)"
                                        value={soc.label}
                                        onChange={(e) => handleUpdateSocial(idx, 'label', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Icon (fa-brands fa-github)"
                                        value={soc.icon}
                                        onChange={(e) => handleUpdateSocial(idx, 'icon', e.target.value)}
                                    />
                                    <input
                                        type="url"
                                        className="adm-input"
                                        placeholder="Profile URL"
                                        value={soc.href}
                                        onChange={(e) => handleUpdateSocial(idx, 'href', e.target.value)}
                                    />
                                    <div className="adm-repeater-actions">
                                        <input
                                            type="color"
                                            value={soc.color || '#38bdf8'}
                                            onChange={(e) => handleUpdateSocial(idx, 'color', e.target.value)}
                                            style={{ width: '38px', height: '34px', background: 'none', border: 'none', cursor: 'pointer', verticalAlign: 'middle' }}
                                            title="Hover Color"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSocial(idx)}
                                            className="adm-btn adm-btn-danger adm-btn-sm"
                                            style={{ padding: '6px 10px' }}
                                            title="Delete"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Quick Links List */}
                    <div className="adm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="adm-card-title" style={{ margin: 0 }}>
                                <i className="fa-solid fa-link" style={{ color: 'var(--adm-primary)' }} />
                                Quick Navigation Links ({footerForm.quickLinks.length})
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddQuickLink}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                            >
                                <i className="fa-solid fa-plus" /> Add Quick Link
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {footerForm.quickLinks.map((ql, idx) => (
                                <div key={idx} className="adm-repeater-row">
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Label (e.g. Home)"
                                        value={ql.label}
                                        onChange={(e) => handleUpdateQuickLink(idx, 'label', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Target (#home, /privacy)"
                                        value={ql.href}
                                        onChange={(e) => handleUpdateQuickLink(idx, 'href', e.target.value)}
                                    />
                                    <div className="adm-repeater-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteQuickLink(idx)}
                                            className="adm-btn adm-btn-danger adm-btn-sm"
                                            style={{ padding: '6px 10px' }}
                                            title="Delete"
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6. Section Visibility Toggles & Copyright */}
                    <div className="adm-card">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-toggle-on" style={{ color: 'var(--adm-primary)' }} />
                            Display Toggles &amp; Copyright
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={footerForm.showNewsletter}
                                    onChange={(e) => setFooterForm({ ...footerForm, showNewsletter: e.target.checked })}
                                />
                                Show Newsletter Form
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={footerForm.showSocials}
                                    onChange={(e) => setFooterForm({ ...footerForm, showSocials: e.target.checked })}
                                />
                                Show Social Icons
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={footerForm.showQuickLinks}
                                    onChange={(e) => setFooterForm({ ...footerForm, showQuickLinks: e.target.checked })}
                                />
                                Show Quick Links
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={footerForm.showContactInfo}
                                    onChange={(e) => setFooterForm({ ...footerForm, showContactInfo: e.target.checked })}
                                />
                                Show Get in Touch
                            </label>
                        </div>

                        <div className="adm-form-group" style={{ margin: 0 }}>
                            <label className="adm-label">Copyright Text (Bottom Bar)</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={footerForm.copyrightText}
                                onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            className="adm-btn adm-btn-primary"
                            style={{ padding: '12px 30px', fontSize: '14px' }}
                        >
                            {saving ? (
                                <><i className="fa-solid fa-circle-notch fa-spin" /> Saving Changes...</>
                            ) : (
                                <><i className="fa-solid fa-floppy-disk" /> Publish Footer Settings</>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* ══════════════════════════════════════════════════════════════
                 MODAL: DIRECT EMAIL TO SUBSCRIBER
            ══════════════════════════════════════════════════════════════ */}
            {emailModalSub && (
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
                    <div className="adm-card" style={{ width: '100%', maxWidth: '540px', padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--adm-primary)' }} />
                                Email to {emailModalSub.email}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEmailModalSub(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '18px' }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Subject</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                            />
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Message Body</label>
                            <textarea
                                className="adm-textarea"
                                rows={6}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                            <a
                                href={gmailComposeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="adm-btn adm-btn-primary"
                                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                                onClick={() => setEmailModalSub(null)}
                            >
                                <i className="fa-solid fa-envelope-open-text" /> Open in Web Gmail
                            </a>

                            <a
                                href={`mailto:${emailModalSub.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                                className="adm-btn adm-btn-secondary"
                                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                                onClick={() => setEmailModalSub(null)}
                            >
                                <i className="fa-solid fa-paper-plane" /> Default Mail App
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
