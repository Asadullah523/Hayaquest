import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/haya-tracking';

const dataBackupSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    data: {
        subjects: Array,
        topics: Array,
        logs: Array,
        timetable: Array,
        settings: Array,
        resources: Array,
        gamification: Object,
        achievements: Array,
        writingChecker: Object,
        englishProgress: Object,
        user: Object,
        timer: Object
    },
    lastSynced: {
        type: Date,
        default: Date.now
    }
});

const DataBackup = mongoose.models.DataBackup || mongoose.model('DataBackup', dataBackupSchema);

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        await connectDB();
        const backup = await DataBackup.findOne({ userId });

        if (!backup) return res.status(404).json({ message: 'No backup found' });
        res.json(backup.data);
    } catch (err) {
        console.error('SERVERLESS RESTORE ERROR:', err);
        res.status(err.name === 'JsonWebTokenError' ? 401 : 500).json({
            message: err.name === 'JsonWebTokenError' ? 'Token is not valid' : 'Server error',
            error: err.message
        });
    }
}
