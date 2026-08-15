// src/config/api.js

/**
 * Dynamically resolves the API Base URL.
 * Supports:
 * - Environment variable VITE_API_URL (production / deployed backend)
 * - Mobile devices / LAN access (e.g. 192.168.x.x:5173 -> 192.168.x.x:5000/api)
 * - Desktop localhost (localhost:5173 -> localhost:5000/api)
 */
export const getApiBase = () => {
    // 1. Explicit environment variable
    if (import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    }

    // 2. Client-side browser auto-detection for LAN / Mobile access
    if (typeof window !== 'undefined' && window.location) {
        const { hostname, protocol, port } = window.location;
        
        // If accessed from a mobile phone or another device over Wi-Fi/LAN (non-localhost IP)
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // If running on Vite dev port (5173, 3000, etc.), point to backend port 5000 on the same machine
            if (port === '5173' || port === '3000' || port === '4173' || port === '8080') {
                return `${protocol}//${hostname}:5000/api`;
            }
            // Production deployment on custom domain / reverse proxy
            return `${protocol}//${hostname}/api`;
        }
    }

    // 3. Default fallback
    return 'http://localhost:5000/api';
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

    if (typeof window !== 'undefined' && window.location) {
        const { hostname, protocol, port } = window.location;
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
            if (port === '5173' || port === '3000' || port === '4173' || port === '8080') {
                return `${protocol}//${hostname}:5000${cleanPath}`;
            }
            return `${protocol}//${hostname}${cleanPath}`;
        }
    }

    return `http://localhost:5000${cleanPath}`;
};
