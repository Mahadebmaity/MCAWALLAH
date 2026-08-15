// src/admin/AdminAuthGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminAuthGuard() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#090d16',
                color: '#38bdf8',
                fontSize: '18px',
                fontWeight: '600',
                gap: '12px'
            }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px' }}></i>
                Loading Portfolio Admin Studio...
            </div>
        );
    }

    // If not logged in or not admin, redirect to admin login
    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
