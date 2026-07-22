const mongoose = require('mongoose');

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
        achievements: Object, // Changed from Array to Object to support stats + unlockedAchievements
        writingChecker: Object,
        englishProgress: Object,
        quiz: Object,
        user: Object, // Added
        timer: Object, // Added
        timetableStore: Object, // Added for completedSlots sync
        imat: Object, // Added for ImatDashboard sync
        lastResetAt: Number
    },
    lastSynced: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DataBackup', dataBackupSchema);
