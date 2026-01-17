const express = require('express');
const multer = require('multer');
const aiService = require('../aiService');

const router = express.Router();

// Configure multer for memory storage (no disk write needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/detect
 * Analyze an image for pothole detection
 * Body: multipart/form-data with 'image' field
 * Returns: { detected, predictions, suggestedSeverity, detectionCount }
 */
router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get image buffer from multer
    const imageBuffer = req.file.buffer;

    // Validate API credentials
    if (!process.env.ROBOFLOW_API_KEY || !process.env.ROBOFLOW_MODEL_ENDPOINT) {
      return res.status(500).json({
        success: false,
        message: 'Roboflow API credentials not configured'
      });
    }

    // Call AI service to detect potholes
    const result = await aiService.detectPothole(imageBuffer);

    res.json({
      success: true,
      data: {
        detected: result.detected,
        predictions: result.predictions,
        suggestedSeverity: result.suggestedSeverity,
        detectionCount: result.detectionCount,
        message: result.detected
          ? `Detected ${result.detectionCount} pothole(s)`
          : 'No potholes detected in image',
        annotatedImage: result.annotatedImage
      }
    });

  } catch (error) {
    console.error('Detection route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/detect/health
 * Check if AI detection service is configured and ready
 */
router.get('/detect/health', (req, res) => {
  const isConfigured = !!(process.env.ROBOFLOW_API_KEY && process.env.ROBOFLOW_MODEL_ENDPOINT);

  res.json({
    success: true,
    configured: isConfigured,
    message: isConfigured
      ? 'AI detection service is ready'
      : 'AI detection service not configured - add ROBOFLOW_API_KEY and ROBOFLOW_MODEL_ENDPOINT to .env'
  });
});

module.exports = router;
