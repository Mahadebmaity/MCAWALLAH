import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectUser = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied: Please sign in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_access_key_portfolio_2026_!@#$%^');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found or authorization revoked.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
};

export const protectAdmin = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied: No authentication token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_access_key_portfolio_2026_!@#$%^');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found or authorization revoked.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin privileges required.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Session expired or token invalid. Please log in again.' });
    }
};

export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'super_secret_jwt_access_key_portfolio_2026_!@#$%^',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_portfolio_2026_&*()_+',
        { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
};

export const protect = protectUser;
export const adminOnly = protectAdmin;

export default {
    protectUser,
    protectAdmin,
    protect,
    adminOnly,
    generateTokens
};
