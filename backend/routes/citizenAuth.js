const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/citizen/register
// @desc    Register a new citizen
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, city, state, pincode } = req.body;

    // Check if user already exists
    const existingCitizen = await Citizen.findOne({ email });
    if (existingCitizen) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new citizen
    const citizen = await Citizen.create({
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode
    });

    // Generate token
    const token = generateToken(citizen._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone,
        city: citizen.city,
        points: citizen.points,
        reportsSubmitted: citizen.reportsSubmitted
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/citizen/login
// @desc    Login citizen
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find citizen and include password field
    const citizen = await Citizen.findOne({ email }).select('+password');

    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!citizen.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordMatch = await citizen.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(citizen._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone,
        city: citizen.city,
        points: citizen.points,
        reportsSubmitted: citizen.reportsSubmitted,
        reportsResolved: citizen.reportsResolved,
        badges: citizen.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   GET /api/citizen/profile/:id
// @desc    Get citizen profile
// @access  Private (should add auth middleware)
router.get('/profile/:id', async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone,
        address: citizen.address,
        city: citizen.city,
        state: citizen.state,
        pincode: citizen.pincode,
        points: citizen.points,
        reportsSubmitted: citizen.reportsSubmitted,
        reportsResolved: citizen.reportsResolved,
        badges: citizen.badges,
        createdAt: citizen.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

module.exports = router;
