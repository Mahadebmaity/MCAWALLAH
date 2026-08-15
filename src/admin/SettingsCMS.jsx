// src/admin/SettingsCMS.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function SettingsCMS() {
    const { authFetch } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [toast, setToast] = useState(null);
    const fileImportRef = useRef(null);

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
