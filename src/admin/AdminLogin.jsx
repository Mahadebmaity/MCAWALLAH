// src/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('mahadeb@portfolio.com');
    const [password, setPassword] = useState('Admin@123456');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoFilled, setAutoFilled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await login({ email: email.trim(), password: password.trim() });
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Access restricted to administrators only.');
            }
        } catch (err) {
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
                setError('Cannot connect to backend server. Make sure "npm run dev" or the backend server is running on port 5000.');
            } else {
                setError(err.message || 'Login failed. Please check your email and password.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFillDefaults = () => {
        setEmail('mahadeb@portfolio.com');
        setPassword('Admin@123456');
        setError(null);
        setAutoFilled(true);
        setTimeout(() => setAutoFilled(false), 2500);
    };

    return (
        <div className="adm-login-wrap">
            <div className="adm-login-card">
                <div className="adm-login-header">
                    <div className="adm-login-icon">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h1 className="adm-login-title">Admin Studio</h1>
                    <p className="adm-login-sub">Sign in to manage your portfolio &amp; content</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '13px',
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#fca5a5', paddingLeft: '22px' }}>
                            Default login: <strong style={{ color: '#fff' }}>mahadeb@portfolio.com</strong> / <strong style={{ color: '#fff' }}>Admin@123456</strong>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="adm-form-group">
                        <label className="adm-label">Admin Email</label>
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            className="adm-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="mahadeb@portfolio.com"
                        />
                    </div>

                    <div className="adm-form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="adm-label">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--adm-accent, #38bdf8)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            className="adm-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="adm-btn adm-btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-lock-open"></i>
                                Enter Admin Panel
                            </>
                        )}
                    </button>

                    <div style={{ marginTop: '14px', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={handleFillDefaults}
                            style={{
                                background: autoFilled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.08)',
                                border: autoFilled ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(56, 189, 248, 0.2)',
                                borderRadius: '6px',
                                color: autoFilled ? '#4ade80' : '#38bdf8',
                                fontSize: '11.5px',
                                padding: '7px 14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <i className={`fa-solid ${autoFilled ? 'fa-circle-check' : 'fa-wand-magic-sparkles'}`}></i>
                            {autoFilled ? 'Default Credentials Applied!' : 'Auto-fill Default Admin Credentials'}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link to="/" style={{ color: 'var(--adm-text-muted)', fontSize: '13px', textDecoration: 'none' }}>
                        <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                        Back to Public Portfolio
                    </Link>
                </div>
            </div>
        </div>
    );
}
