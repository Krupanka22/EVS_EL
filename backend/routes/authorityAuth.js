const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Authority = require('../models/Authority');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/authority/register
// @desc    Register a new authority
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      department, 
      designation, 
      employeeId, 
      city, 
      state, 
      zone 
    } = req.body;

    // Check if authority already exists
    const existingAuthority = await Authority.findOne({ 
      $or: [{ email }, { employeeId }] 
    });

    if (existingAuthority) {
      return res.status(400).json({
        success: false,
        message: existingAuthority.email === email 
          ? 'Email already registered' 
          : 'Employee ID already registered'
      });
    }

    // Create new authority
    const authority = await Authority.create({
      name,
      email,
      phone,
      password,
      department,
      designation,
      employeeId,
      city,
      state,
      zone
    });

    // Generate token
    const token = generateToken(authority._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account will be verified by admin.',
      token,
      user: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        phone: authority.phone,
        department: authority.department,
        designation: authority.designation,
        employeeId: authority.employeeId,
        city: authority.city,
        isVerified: authority.isVerified
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

// @route   POST /api/authority/login
// @desc    Login authority
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

    // Find authority and include password field
    const authority = await Authority.findOne({ email }).select('+password');

    if (!authority) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!authority.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.'
      });
    }

    // Check if account is verified
    if (!authority.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified yet. Please wait for admin approval.'
      });
    }

    // Verify password
    const isPasswordMatch = await authority.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(authority._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        phone: authority.phone,
        department: authority.department,
        designation: authority.designation,
        employeeId: authority.employeeId,
        city: authority.city,
        zone: authority.zone,
        reportsHandled: authority.reportsHandled,
        reportsResolved: authority.reportsResolved,
        isVerified: authority.isVerified
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

// @route   GET /api/authority/profile/:id
// @desc    Get authority profile
// @access  Private (should add auth middleware)
router.get('/profile/:id', async (req, res) => {
  try {
    const authority = await Authority.findById(req.params.id);

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        phone: authority.phone,
        department: authority.department,
        designation: authority.designation,
        employeeId: authority.employeeId,
        city: authority.city,
        state: authority.state,
        zone: authority.zone,
        reportsHandled: authority.reportsHandled,
        reportsResolved: authority.reportsResolved,
        isVerified: authority.isVerified,
        createdAt: authority.createdAt
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
