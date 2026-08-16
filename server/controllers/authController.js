import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateTokens } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

// @desc Register User / Admin
// @route POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // If first user, make admin, otherwise user
        const isFirst = (await User.countDocuments()) === 0;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: isFirst ? 'admin' : 'user',
            lastLogin: new Date(),
            loginCount: 1,
            lastIp: clientIp,
            device: userAgent.slice(0, 100),
            preferences: {
                darkMode: true,
                background: 'mesh',
                accentColor: '#e84545'
            }
        });

        // Record Activity Log
        try {
            await ActivityLog.create({
                user: user._id,
                userName: user.name,
                userEmail: user.email,
                userRole: user.role,
                action: 'USER_SIGNUP',
                category: 'auth',
                details: `New account registered (${user.role.toUpperCase()})`,
                ipAddress: clientIp,
                userAgent
            });
        } catch (e) {
            console.error('Activity log error:', e);
        }

        const tokens = generateTokens(user._id);

        res.status(201).json({
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

// @desc Login User / Admin
// @route POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        // Update login stats
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        user.lastIp = clientIp;
        user.device = userAgent.slice(0, 100);
        await user.save();

        // Record Activity Log
        try {
            await ActivityLog.create({
                user: user._id,
                userName: user.name,
                userEmail: user.email,
                userRole: user.role,
                action: 'USER_LOGIN',
                category: 'auth',
                details: `User logged in (Session #${user.loginCount})`,
                ipAddress: clientIp,
                userAgent
            });
        } catch (e) {
            console.error('Activity log error:', e);
        }

        const tokens = generateTokens(user._id);

        res.json({
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Current Logged In User
// @route GET /api/user/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Refresh Access Token
// @route POST /api/auth/refresh
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required.' });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_portfolio_2026_&*()_+'
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        const tokens = generateTokens(user._id);
        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        res.status(401).json({ message: 'Refresh token expired or invalid.' });
    }
};

// @desc Update Profile Details
// @route PUT /api/user/profile
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.name) user.name = req.body.name.trim();

        if (req.body.email) {
            const newEmail = req.body.email.trim().toLowerCase();
            if (newEmail !== user.email) {
                const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
                if (existing) {
                    return res.status(400).json({ message: 'An account with this email already exists.' });
                }
                user.email = newEmail;
            }
        }

        await user.save();

        res.json({
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Change Password
// @route PUT /api/user/password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully! Please remember your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Reset Admin Credentials to Default (mahadeb@portfolio.com / Admin@123456)
// @route POST /api/user/reset-defaults
export const resetToDefaultCredentials = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = 'Mahadeb Maity';
        user.email = 'mahadeb@portfolio.com';
        user.password = 'Admin@123456';
        await user.save();

        res.json({
            message: 'Admin credentials reset to defaults (mahadeb@portfolio.com / Admin@123456)',
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Theme Preferences
// @route PUT /api/user/preferences
export const updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.preferences = {
            ...user.preferences,
            ...req.body
        };

        await user.save();
        res.json({ preferences: user.preferences });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Upload User Avatar
// @route POST /api/user/avatar
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file.' });
        }

        let avatarUrl = '';

        if (isCloudinaryConfigured()) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolio_avatars',
                        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            avatarUrl = uploadResult.secure_url;
        } else {
            // Local fallback
            const filename = `avatar-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const uploadPath = path.resolve('public', 'uploads', filename);
            fs.writeFileSync(uploadPath, req.file.buffer);
            const protocol = req.protocol;
            const host = req.get('host');
            avatarUrl = `${protocol}://${host}/uploads/${filename}`;
        }

        const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });

        res.json({
            message: 'Avatar uploaded successfully',
            avatarUrl,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Remove User Avatar
// @route DELETE /api/user/avatar
export const removeAvatar = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { avatar: null });
        res.json({ message: 'Avatar removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Logout user
// @route POST /api/auth/logout
export const logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
