const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../server/models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
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
        throw err;
    }
};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('Login attempt started...');
        await connectDB();
        console.log('DB connected, finding user...');

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token, user: { email: user.email, name: user.name, avatar: user.avatar } });
    } catch (err) {
        console.error('SERVERLESS LOGIN ERROR:', {
            message: err.message,
            stack: err.stack,
            uri: MONGODB_URI ? 'SET' : 'MISSING'
        });
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            stack: err.stack,
            env: {
                hasMongo: !!process.env.MONGODB_URI,
                hasJwt: !!process.env.JWT_SECRET
            }
        });
    }
};
