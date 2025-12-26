import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/haya-tracking';

// Define User Schema directly to avoid path issues on Vercel
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: 'fox'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Check if model exists before compiling
const User = mongoose.models.User || mongoose.model('User', userSchema);

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

export default async function handler(req, res) {
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
        console.log('Signup attempt started...');
        await connectDB();

        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password, name });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(201).json({ token, user: { email, name, avatar: user.avatar } });
    } catch (err) {
        console.error('SERVERLESS SIGNUP ERROR:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            stack: err.stack
        });
    }
}
