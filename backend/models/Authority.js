const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  department: {
    type: String,
    required: [true, 'Please provide your department'],
    enum: ['Municipal Corporation', 'Public Works Department', 'Road Maintenance', 'City Administration', 'Other']
  },
  designation: {
    type: String,
    required: [true, 'Please provide your designation'],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Please provide your employee ID'],
    unique: true,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please provide your city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please provide your state'],
    trim: true
  },
  zone: {
    type: String,
    trim: true
  },
  reportsHandled: {
    type: Number,
    default: 0
  },
  reportsResolved: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
authoritySchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
authoritySchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Authority', authoritySchema);
