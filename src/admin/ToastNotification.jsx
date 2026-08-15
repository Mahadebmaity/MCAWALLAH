// src/admin/ToastNotification.jsx
import { useEffect } from 'react';

export default function ToastNotification({ toast, onClose }) {
    if (!toast) return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    const isSuccess = toast.type !== 'error';

    return (
        <div className={`adm-toast-container ${isSuccess ? 'adm-toast-success' : 'adm-toast-error'}`}>
            <div className="adm-toast-icon">
                <i className={`fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            </div>
            <div className="adm-toast-content">
                <h4 className="adm-toast-title">
                    {toast.title || (isSuccess ? 'Success!' : 'Error')}
                </h4>
                <p className="adm-toast-message">{toast.message}</p>
                {toast.action && (
                    <div className="adm-toast-action">
                        {toast.action}
                    </div>
                )}
            </div>
            <button className="adm-toast-close" onClick={onClose} aria-label="Close Notification">
                <i className="fa-solid fa-xmark" />
            </button>
        </div>
    );
}
