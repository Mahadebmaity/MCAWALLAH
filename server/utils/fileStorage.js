import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUploadDirectories = () => {
    const dirs = [
        path.resolve(process.cwd(), 'public', 'uploads'),
        path.resolve(process.cwd(), 'server', 'public', 'uploads'),
        path.resolve(process.cwd(), 'server', 'uploads'),
        path.resolve(__dirname, '..', 'public', 'uploads'),
        path.resolve(__dirname, '..', '..', 'public', 'uploads'),
        path.resolve(__dirname, '..', 'uploads')
    ];
    // Return unique existing/valid paths
    return [...new Set(dirs)];
};

export const getDocsDirectories = () => {
    const dirs = [
        path.resolve(process.cwd(), 'public', 'docs'),
        path.resolve(process.cwd(), 'server', 'public', 'docs'),
        path.resolve(__dirname, '..', 'public', 'docs'),
        path.resolve(__dirname, '..', '..', 'public', 'docs')
    ];
    return [...new Set(dirs)];
};

export const saveBufferToAllUploadDirs = (filename, buffer) => {
    const dirs = getUploadDirectories();
    let saved = 0;
    dirs.forEach(dir => {
        try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.resolve(dir, filename), buffer);
            saved++;
        } catch (_) {}
    });
    return saved;
};

export const findFileInUploadsOrDocs = (filename) => {
    if (!filename) return null;
    const clean = filename.replace(/^(\/|\\)*(uploads|docs|api\/uploads|api\/docs)\//i, '').replace(/^[\\/]+/, '');
    
    // 1. Search in upload directories
    for (const dir of getUploadDirectories()) {
        try {
            const full = path.resolve(dir, clean);
            if (fs.existsSync(full) && fs.statSync(full).isFile()) {
                return full;
            }
        } catch (_) {}
    }

    // 2. Search in docs directories
    for (const dir of getDocsDirectories()) {
        try {
            const full = path.resolve(dir, clean);
            if (fs.existsSync(full) && fs.statSync(full).isFile()) {
                return full;
            }
        } catch (_) {}
    }

    // 3. Fallback search in public roots
    const publicRoots = [
        path.resolve(process.cwd(), 'public'),
        path.resolve(__dirname, '..', 'public'),
        path.resolve(__dirname, '..', '..', 'public')
    ];
    for (const dir of publicRoots) {
        try {
            const full = path.resolve(dir, clean);
            if (fs.existsSync(full) && fs.statSync(full).isFile()) {
                return full;
            }
        } catch (_) {}
    }

    return null;
};
