const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('../server/routes/auth');
const syncRoutes = require('../server/routes/sync');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/auth', authRoutes);
app.use('/sync', syncRoutes);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(m => {
      return m;
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection error' });
    return;
  }
  return app(req, res);
};
