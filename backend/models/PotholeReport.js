const mongoose = require('mongoose');

const potholeReportSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please provide location'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Please provide latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please provide longitude']
  },
  address: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    trim: true
  },
  photos: [{
    url: String,
    filename: String,
    latitude: Number,
    longitude: Number,
    address: String,
    timestamp: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority'
  },
  assignedTeam: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  resolutionNotes: {
    type: String,
    trim: true
  },
  beforePhotos: [{
    url: String,
    uploadedAt: Date
  }],
  afterPhotos: [{
    url: String,
    uploadedAt: Date
  }],
  citizenRating: {
    type: Number,
    min: 1,
    max: 5
  },
  citizenFeedback: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt timestamp before saving
potholeReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PotholeReport', potholeReportSchema);
