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

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await login({ email, password });
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Access restricted to administrators only.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
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
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="adm-form-group">
                        <label className="adm-label">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="adm-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@portfolio.com"
                        />
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Password</label>
                        <input
                            type="password"
                            required
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
