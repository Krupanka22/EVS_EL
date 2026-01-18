const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    description: String,
    status: {
        type: String,
        enum: ['reported', 'in-progress', 'resolved'],
        default: 'reported'
    },
    photos: [{
        url: String, // Base64 or URL
        detected: Boolean,
        confidence: Number,
        timestamp: Date
    }],
    userType: {
        type: String,
        default: 'citizen'
    },
    votes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
