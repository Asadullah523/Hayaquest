const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('../server/routes/auth');
const syncRoutes = require('../server/routes/sync');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes - no /api prefix needed, Vercel already routes /api/* here
app.use('/auth', authRoutes);
app.use('/sync', syncRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/haya-tracking';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};
