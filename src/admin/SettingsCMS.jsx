// src/admin/SettingsCMS.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function SettingsCMS() {
    const { user, updateProfile, changePassword, resetToDefaultCredentials, authFetch } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [toast, setToast] = useState(null);
    const fileImportRef = useRef(null);

    // Admin Credentials State
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Mahadeb Maity',
        email: user?.email || 'mahadeb@portfolio.com'
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    const [pwData, setPwData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPw, setShowPw] = useState(false);
    const [updatingPw, setUpdatingPw] = useState(false);
    const [resettingDefaults, setResettingDefaults] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!profileData.name.trim() || !profileData.email.trim()) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Name and Email are required.' });
            return;
        }
        setUpdatingProfile(true);
        try {
            await updateProfile(profileData);
            setToast({
                type: 'success',
                title: 'Profile Updated! 👤',
                message: 'Your admin username & email have been updated successfully.',
                duration: 4000
            });
        } catch (err) {
            setToast({ type: 'error', title: 'Update Failed', message: err.message });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!pwData.currentPassword || !pwData.newPassword) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Current and New Password are required.' });
            return;
        }
        if (pwData.newPassword.length < 6) {
            setToast({ type: 'error', title: 'Validation Error', message: 'New password must be at least 6 characters.' });
            return;
        }
        if (pwData.newPassword !== pwData.confirmPassword) {
            setToast({ type: 'error', title: 'Validation Error', message: 'New passwords do not match.' });
            return;
        }

        setUpdatingPw(true);
        try {
            await changePassword({
                currentPassword: pwData.currentPassword,
                newPassword: pwData.newPassword
            });
            setToast({
                type: 'success',
                title: 'Password Updated! 🔒',
                message: 'Your admin login password has been changed. Please remember your new password.',
                duration: 5000
            });
            setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setToast({ type: 'error', title: 'Password Change Failed', message: err.message });
        } finally {
            setUpdatingPw(false);
        }
    };

    const handleResetDefaults = async () => {
        if (!window.confirm('Are you sure you want to reset admin credentials to defaults?\n\nEmail: mahadeb@portfolio.com\nPassword: Admin@123456')) {
            return;
        }
        setResettingDefaults(true);
        try {
            await resetToDefaultCredentials();
            setProfileData({ name: 'Mahadeb Maity', email: 'mahadeb@portfolio.com' });
            setToast({
                type: 'success',
                title: 'Defaults Restored! ⚡',
                message: 'Admin credentials reset to mahadeb@portfolio.com / Admin@123456',
                duration: 5000
            });
        } catch (err) {
            setToast({ type: 'error', title: 'Reset Failed', message: err.message });
        } finally {
            setResettingDefaults(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (field, val) => {
        setSettings(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSavedSuccess(false);

        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setSavedSuccess(true);
                setToast({
                    type: 'success',
                    title: 'Settings Saved! 🎉',
                    message: 'SEO metadata, contact info, and site settings updated.',
                    duration: 4000
                });
                setTimeout(() => setSavedSuccess(false), 3000);
            } else {
                throw new Error('Failed to update settings');
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

    const handleExportBackup = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/admin/backup/export', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setToast({
                type: 'success',
                title: 'Backup Downloaded! 📦',
                message: 'Your full portfolio JSON snapshot has been saved.'
            });
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Backup Export Failed',
                message: err.message
            });
        }
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm('WARNING: Importing this backup will overwrite existing portfolio content. Continue?')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const res = await authFetch('http://localhost:5000/api/admin/backup/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json)
                });
                if (res.ok) {
                    setToast({
                        type: 'success',
                        title: 'Backup Restored Successfully! 🔄',
                        message: 'All sections have been restored to your portfolio.'
                    });
                    fetchSettings();
                } else {
                    throw new Error('Restore failed');
                }
            } catch (err) {
                setToast({
                    type: 'error',
                    title: 'Restore Failed',
                    message: 'Invalid or corrupt JSON backup file.'
                });
            }
        };
        reader.readAsText(file);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Settings...</div>;

    return (
        <div>
            {/* Interactive Toast Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            <form onSubmit={handleSave}>
                <div className="adm-card">
                    <div className="adm-card-header">
                        <h3 className="adm-card-title">
                            <i className="fa-solid fa-globe" style={{ color: 'var(--adm-primary)' }}></i>
                            SEO &amp; General Configuration
                        </h3>
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Website Title Tag</label>
                        <input
                            type="text"
                            className="adm-input"
                            value={settings?.siteTitle || ''}
                            onChange={(e) => handleChange('siteTitle', e.target.value)}
                        />
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Meta Description (For Google Search &amp; Social Previews)</label>
                        <textarea
                            rows={3}
                            className="adm-textarea"
                            value={settings?.metaDescription || ''}
                            onChange={(e) => handleChange('metaDescription', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="adm-grid-3">
                        <div className="adm-form-group">
                            <label className="adm-label">Contact Email</label>
                            <input
                                type="email"
                                className="adm-input"
                                value={settings?.contactEmail || ''}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                            />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Contact Phone</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={settings?.contactPhone || ''}
                                onChange={(e) => handleChange('contactPhone', e.target.value)}
                            />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Location</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={settings?.contactLocation || ''}
                                onChange={(e) => handleChange('contactLocation', e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="adm-btn adm-btn-primary"
                        style={{
                            background: savedSuccess ? '#059669' : undefined,
                            borderColor: savedSuccess ? '#34d399' : undefined,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        {saving ? (
                            <><i className="fa-solid fa-circle-notch fa-spin" /> Saving...</>
                        ) : savedSuccess ? (
                            <><i className="fa-solid fa-circle-check" /> Saved Successfully!</>
                        ) : (
                            <><i className="fa-solid fa-floppy-disk" /> Save Configuration</>
                        )}
                    </button>
                </div>
            </form>

            {/* ── Admin Account & Security Manager ── */}
            <div className="adm-card" style={{ border: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)' }}>
                <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="adm-card-title">
                        <i className="fa-solid fa-user-shield" style={{ color: '#38bdf8' }}></i>
                        Admin Account &amp; Security Credentials
                    </h3>
                    <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '999px', fontWeight: '600' }}>
                        🔒 Protected Admin Area
                    </span>
                </div>

                {/* Info Bar */}
                <div style={{ background: 'var(--adm-surface)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                            Active Admin: <span style={{ color: 'var(--adm-primary)' }}>{user?.name || 'Mahadeb Maity'}</span> ({user?.email || 'mahadeb@portfolio.com'})
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                            Default Credentials: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>mahadeb@portfolio.com</code> / <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>Admin@123456</code>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        disabled={resettingDefaults}
                        className="adm-btn adm-btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#eab308' }}
                        title="Reset email & password back to factory defaults"
                    >
                        <i className="fa-solid fa-rotate-left" /> {resettingDefaults ? 'Resetting...' : 'Reset to Default Credentials'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {/* 1. Change Username & Email */}
                    <form onSubmit={handleUpdateProfile} style={{ background: 'var(--adm-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--adm-border)' }}>
                        <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-id-card" style={{ color: 'var(--adm-primary)' }} />
                            Change Admin Username &amp; Email
                        </h4>

                        <div className="adm-form-group">
                            <label className="adm-label">Admin Name / Username</label>
                            <input
                                type="text"
                                className="adm-input"
                                value={profileData.name}
                                onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                                placeholder="Mahadeb Maity"
                                required
                            />
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Admin Login Email</label>
                            <input
                                type="email"
                                className="adm-input"
                                value={profileData.email}
                                onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                                placeholder="mahadeb@portfolio.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updatingProfile}
                            className="adm-btn adm-btn-primary"
                            style={{ width: '100%', marginTop: '6px' }}
                        >
                            {updatingProfile ? (
                                <><i className="fa-solid fa-circle-notch fa-spin" /> Saving Changes...</>
                            ) : (
                                <><i className="fa-solid fa-check" /> Update Username &amp; Email</>
                            )}
                        </button>
                    </form>

                    {/* 2. Change Password */}
                    <form onSubmit={handleUpdatePassword} style={{ background: 'var(--adm-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--adm-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-key" style={{ color: '#ec4899' }} />
                                Change Admin Password
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '12px' }}
                            >
                                <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} /> {showPw ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Current Password</label>
                            <input
                                type={showPw ? "text" : "password"}
                                className="adm-input"
                                value={pwData.currentPassword}
                                onChange={(e) => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">New Password (min 6 chars)</label>
                            <input
                                type={showPw ? "text" : "password"}
                                className="adm-input"
                                value={pwData.newPassword}
                                onChange={(e) => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Confirm New Password</label>
                            <input
                                type={showPw ? "text" : "password"}
                                className="adm-input"
                                value={pwData.confirmPassword}
                                onChange={(e) => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updatingPw}
                            className="adm-btn adm-btn-primary"
                            style={{ width: '100%', marginTop: '6px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', borderColor: 'transparent' }}
                        >
                            {updatingPw ? (
                                <><i className="fa-solid fa-circle-notch fa-spin" /> Updating Password...</>
                            ) : (
                                <><i className="fa-solid fa-lock" /> Change Password</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── JSON Backup & Restore ── */}
            <div className="adm-card">
                <div className="adm-card-header">
                    <h3 className="adm-card-title">
                        <i className="fa-solid fa-database" style={{ color: 'var(--adm-warning)' }}></i>
                        One-Click Backup &amp; Restore (JSON)
                    </h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', marginBottom: '16px' }}>
                    Download a full snapshot of your entire portfolio (Hero, Skills, Timeline, Projects, Games, and Settings) as a JSON file, or restore from a previous backup.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={handleExportBackup} className="adm-btn adm-btn-secondary">
                        <i className="fa-solid fa-download"></i> Export Portfolio Backup (JSON)
                    </button>

                    <input
                        type="file"
                        ref={fileImportRef}
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportBackup}
                    />
                    <button
                        type="button"
                        onClick={() => fileImportRef.current?.click()}
                        className="adm-btn adm-btn-danger"
                    >
                        <i className="fa-solid fa-upload"></i> Restore from JSON Backup
                    </button>
                </div>
            </div>
        </div>
    );
}
