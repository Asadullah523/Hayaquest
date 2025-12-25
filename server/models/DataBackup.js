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
        achievements: Array,
        writingChecker: Object,
        englishProgress: Object
    },
    lastSynced: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DataBackup', dataBackupSchema);
