import express from 'express';
import {
    getAdminOverview,
    getSectionData,
    createSectionItem,
    updateSectionItem,
    deleteSectionItem,
    toggleVisibility,
    reorderItems,
    updateMessageStatus,
    exportBackup,
    importBackup,
    getGameAnalytics,
    deleteGameScore,
    uploadDocument,
    getUsersDirectory,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    adminResetUserPassword,
    getUserActivityDetails,
    getActivityLogs,
    clearActivityLogs
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply admin protection to all admin routes
router.use(protectAdmin);

// Dashboard overview
router.get('/overview', getAdminOverview);

// Registered Users Management
router.get('/users', getUsersDirectory);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.post('/users/:id/reset-password', adminResetUserPassword);
router.get('/users/:id/activity', getUserActivityDetails);
router.delete('/users/:id', deleteUser);

// Live Activity & Workflow Telemetry
router.get('/activity-logs', getActivityLogs);
router.delete('/activity-logs/clear', clearActivityLogs);

// Dynamic section CRUD
router.get('/section/:type', getSectionData);
router.post('/section/:type', createSectionItem);
router.put('/section/:type/:id', updateSectionItem);
router.delete('/section/:type/:id', deleteSectionItem);

// Granular controls
router.patch('/section/:type/:id/visibility', toggleVisibility);
router.put('/section/:type/reorder', reorderItems);

// Message status
router.patch('/messages/:id/status', updateMessageStatus);

// Game Scores & Leaderboard Analytics
router.get('/games/scores', getGameAnalytics);
router.delete('/games/scores/:id', deleteGameScore);

// Document Upload
router.post('/upload/document', upload.single('document'), uploadDocument);

// JSON Backup & Restore
router.get('/backup/export', exportBackup);
router.post('/backup/import', importBackup);

export default router;
