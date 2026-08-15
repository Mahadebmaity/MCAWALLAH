// src/config/api.js

/**
 * Resolves the API Base URL.
 * - In development: uses '/api' which Vite proxies directly to http://localhost:5000/api
 *   This eliminates CORS and firewall connection issues for both mobile phones and desktop.
 * - In production: uses import.meta.env.VITE_API_URL or relative '/api'
 */
export const getApiBase = () => {
    if (import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    }
    return '/api';
};

export const API_BASE = getApiBase();
export const API = API_BASE;

/**
 * Resolves static media / uploaded assets URL
 */
export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    if (import.meta.env?.VITE_API_URL) {
        const base = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        return `${base}${cleanPath}`;
    }

    return cleanPath;
};
