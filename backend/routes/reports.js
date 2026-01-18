const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST new report
router.post('/', upload.any(), async (req, res) => {
    try {
        // Parse photos from body if they are sent as base64 strings in the JSON body
        // The client might send 'photos' as a JSON string
        let photos = [];
        if (req.body.photos) {
            try {
                photos = JSON.parse(req.body.photos);
            } catch (e) {
                photos = req.body.photos;
            }
        }

        const newReport = new Report({
            location: req.body.location,
            latitude: Number(req.body.latitude),
            longitude: Number(req.body.longitude),
            severity: req.body.severity,
            description: req.body.description,
            photos: photos,
            userType: req.body.userType || 'citizen'
        });

        const savedReport = await newReport.save();
        res.status(201).json({ success: true, data: savedReport });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
