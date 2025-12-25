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
        const { data } = req.body;
        let backup = await DataBackup.findOne({ userId: req.userId });
        if (backup) {
            backup.data = data;
            backup.lastSynced = Date.now();
        } else {
            backup = new DataBackup({ userId: req.userId, data });
        }
        await backup.save();
        res.json({ message: 'Backup successful' });
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
        await DataBackup.findOneAndDelete({ userId: req.userId });
        res.json({ message: 'Data cleared from cloud' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
