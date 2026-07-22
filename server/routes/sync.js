const express = require('express');
const jwt = require('jsonwebtoken');
const DataBackup = require('../models/DataBackup');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

router.post('/backup', auth, async (req, res) => {
    try {
        const { isIncremental, data: rawData } = req.body;
        const data = rawData || req.body;

        let backup = await DataBackup.findOne({ userId: req.userId });

        // Rate limiting: Prevent syncs more than once every 5 seconds per user
        if (backup && backup.lastSynced && (Date.now() - backup.lastSynced) < 5000) {
            return res.status(429).json({
                message: 'Syncing too frequently. Please wait a few seconds.',
                retryAfter: 5000 - (Date.now() - backup.lastSynced)
            });
        }

        if (backup) {
            if (isIncremental) {
                // Perform deep merge for specific collections
                const collections = ['subjects', 'topics', 'logs', 'timetable', 'settings', 'resources'];
                collections.forEach(key => {
                    if (data[key] && Array.isArray(data[key])) {
                        // Create a map of existing items by syncId for fast lookup
                        const existingMap = new Map();
                        if (backup.data[key]) {
                            backup.data[key].forEach(item => {
                                if (item.syncId) existingMap.set(item.syncId, item);
                            });
                        }

                        // Update existing or add new
                        data[key].forEach(newItem => {
                            if (newItem.syncId) {
                                existingMap.set(newItem.syncId, newItem);
                            } else {
                                // Fallback if syncId missing (shouldn't happen with new sync logic)
                                if (!backup.data[key]) backup.data[key] = [];
                                backup.data[key].push(newItem);
                            }
                        });

                        backup.data[key] = Array.from(existingMap.values());
                    }
                });

                // Overwrite non-array objects (always latest wins for these stores)
                const objectStores = ['gamification', 'achievements', 'writingChecker', 'englishProgress', 'quiz', 'user', 'timer', 'timetableStore', 'imat'];
                objectStores.forEach(key => {
                    if (data[key]) {
                        backup.data[key] = { ...(backup.data[key] || {}), ...data[key] };
                    }
                });

                if (data.lastResetAt) backup.data.lastResetAt = data.lastResetAt;

                // Capacity Management: Prune logs if they exceed a certain threshold (e.g., 2000 items)
                // This keeps the document size under control for thousands of users
                if (backup.data.logs && backup.data.logs.length > 2000) {
                    backup.data.logs = backup.data.logs
                        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Newest first
                        .slice(0, 2000);
                }
            } else {
                // Full overwrite (Legacy/Fallback)
                backup.data = data;
            }
            backup.lastSynced = Date.now();
            backup.markModified('data'); // Critical for nested object updates in Mongoose
        } else {
            backup = new DataBackup({ userId: req.userId, data });
        }

        await backup.save();
        res.json({ message: 'Backup successful' });
    } catch (err) {
        console.error('Backup error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/status', auth, async (req, res) => {
    try {
        const backup = await DataBackup.findOne({ userId: req.userId }, { lastSynced: 1 });
        if (!backup) return res.status(404).json({ message: 'No backup found' });
        res.json({ lastSynced: backup.lastSynced });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/restore', auth, async (req, res) => {
    try {
        const backup = await DataBackup.findOne({ userId: req.userId });
        if (!backup) return res.status(404).json({ message: 'No backup found' });
        res.json(backup.data);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.delete('/reset', auth, async (req, res) => {
    try {
        const { lastResetAt } = req.body;
        const emptyData = {
            subjects: [],
            topics: [],
            logs: [],
            timetable: [],
            settings: [],
            resources: [],
            gamification: { xp: 0, level: 1, unlockedBadges: [] },
            achievements: [],
            writingChecker: {},
            englishProgress: {},
            quiz: {},
            lastResetAt: lastResetAt || Date.now()
        };

        let backup = await DataBackup.findOne({ userId: req.userId });
        if (backup) {
            backup.data = emptyData;
            backup.lastSynced = Date.now();
        } else {
            backup = new DataBackup({ userId: req.userId, data: emptyData });
        }
        await backup.save();
        res.json({ message: 'Data cleared from cloud', lastResetAt: emptyData.lastResetAt });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
