// src/utils/analytics.js
import { API_BASE } from '../config/api';

/**
 * Track user workflow / interaction event to backend activity telemetry
 * @param {Object} options
 * @param {string} options.action - e.g. 'BUTTON_CLICK', 'RESUME_DOWNLOAD', 'GAME_PLAY', 'DOC_VIEW', 'CTA_CLICK'
 * @param {string} [options.category] - e.g. 'cta', 'game', 'document', 'navigation', 'contact'
 * @param {string} [options.details] - Human-readable description
 * @param {Object} [options.metadata] - Extra contextual parameters
 */
export const trackActivity = async ({ action, category = 'general', details = '', metadata = {} }) => {
    try {
        let user = null;
        try {
            const rawUser = localStorage.getItem('portfolio_user');
            if (rawUser) user = JSON.parse(rawUser);
        } catch {}

        const token = localStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(`${API_BASE}/portfolio/track`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                action,
                category,
                details: details || action,
                metadata,
                path: window.location.pathname,
                userName: user?.name || undefined,
                userEmail: user?.email || undefined
            })
        });
    } catch {
        // Silently catch network telemetry errors to avoid interrupting user flows
    }
};
