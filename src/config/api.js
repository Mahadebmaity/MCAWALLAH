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
    // Normalize localhost / loopback URLs that might have been saved in DB
    if (typeof path === 'string' && (path.includes('localhost:5000') || path.includes('127.0.0.1:5000'))) {
        const pathPart = path.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
        return pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    }

    if (path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }

    // Auto-upgrade http to https for live deployments (e.g. onrender.com, vercel.app, cloudinary)
    if (path.startsWith('http://')) {
        if (path.includes('onrender.com') || path.includes('vercel.app') || path.includes('cloudinary.com') || path.includes('netlify.app')) {
            return path.replace(/^http:\/\//, 'https://');
        }
        return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    if (import.meta.env?.VITE_API_URL) {
        const base = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        return `${base}${cleanPath}`;
    }

    return cleanPath;
};

/**
 * Resolves document URLs for preview, iframe viewing, and downloads across mobile & desktop.
 * Gracefully handles doc objects, raw strings, undefined/null, localhost URLs, and production domains.
 */
export const getDocUrl = (urlOrDoc) => {
    if (!urlOrDoc) return '#';
    
    // Extract url string if an object was passed
    let url = typeof urlOrDoc === 'string' ? urlOrDoc : (urlOrDoc.fileUrl || urlOrDoc.url || urlOrDoc.secure_url || urlOrDoc.path || '');
    
    if (!url || typeof url !== 'string' || url === 'undefined' || url === 'null' || url.endsWith('/undefined') || url.trim() === '' || url === '#') {
        return '#';
    }

    url = url.trim();

    // If it's a data or blob URL
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // Normalize localhost / loopback URLs stored in DB
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
        url = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
    }

    // Auto-upgrade http to https for live hostings
    if (url.startsWith('http://')) {
        if (url.includes('onrender.com') || url.includes('vercel.app') || url.includes('cloudinary.com') || url.includes('netlify.app')) {
            return url.replace(/^http:\/\//, 'https://');
        }
        return url;
    }

    // External Cloudinary / AWS / HTTPS URLs
    if (url.startsWith('https://')) {
        return url;
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    // For static /docs/ paths (like PORTFOLIO_SYSTEM_DOCUMENTATION.pdf in frontend public/docs/)
    if (cleanPath.startsWith('/docs/')) {
        return cleanPath;
    }

    // For /uploads/ or /api/uploads/
    if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/api/uploads/')) {
        if (import.meta.env?.VITE_API_URL) {
            const base = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
            const normPath = cleanPath.startsWith('/api/uploads/') ? cleanPath.replace(/^\/api/, '') : cleanPath;
            return `${base}${normPath}`;
        }
        // In local development or same-domain proxy, return clean relative route
        return cleanPath;
    }

    return cleanPath;
};

/**
 * Universal Safe Document Downloader
 * - Fixes browser cross-origin download restrictions by fetching as binary Blob
 * - Validates MIME type to prevent downloading HTML 404/SPA error pages as corrupted PDF files
 * - Automatically ensures clean and proper '.pdf' file extension
 */
export const downloadFile = async (urlOrDoc, defaultFileName = 'Resume.pdf') => {
    try {
        const resolvedUrl = getDocUrl(urlOrDoc);
        if (!resolvedUrl || resolvedUrl === '#') {
            console.error('Download cancelled: Invalid document URL');
            return false;
        }

        // Clean desired filename
        let cleanName = (defaultFileName || 'Resume').trim().replace(/[/\\?%*:|"<>]/g, '_');
        if (!cleanName.toLowerCase().endsWith('.pdf') && !cleanName.toLowerCase().endsWith('.docx') && !cleanName.toLowerCase().endsWith('.doc')) {
            cleanName = `${cleanName}.pdf`;
        }

        // 1. If it's a data or blob URL, trigger instant direct download
        if (resolvedUrl.startsWith('data:') || resolvedUrl.startsWith('blob:')) {
            const a = document.createElement('a');
            a.href = resolvedUrl;
            a.download = cleanName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
        }

        // 2. Fetch as binary Blob to ensure reliable cross-origin & local downloads
        const response = await fetch(resolvedUrl);
        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        // If server returned HTML (SPA fallback or 404 web page), do NOT save it as a PDF
        if (contentType.includes('text/html')) {
            console.warn('Server returned HTML response instead of binary PDF stream. Opening directly in new tab.');
            window.open(resolvedUrl, '_blank');
            return false;
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
        return true;
    } catch (err) {
        console.warn('Blob download fetch error, falling back to direct window download:', err.message);
        // Fallback: Open in new tab so browser native PDF viewer handles it
        const fallbackUrl = getDocUrl(urlOrDoc);
        if (fallbackUrl && fallbackUrl !== '#') {
            window.open(fallbackUrl, '_blank');
        }
        return false;
    }
};
