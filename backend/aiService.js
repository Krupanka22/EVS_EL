const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_MODEL_ENDPOINT = process.env.ROBOFLOW_MODEL_ENDPOINT;

/**
 * Detects potholes in an image using Roboflow API
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<Object>} Detection results with predictions and suggested severity
 */
async function detectPothole(imageBuffer) {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Call Roboflow API
    const response = await axios({
      method: 'POST',
      url: ROBOFLOW_MODEL_ENDPOINT,
      params: {
        api_key: ROBOFLOW_API_KEY
      },
      data: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const predictions = response.data.predictions || [];

    // Calculate suggested severity based on detections
    const suggestedSeverity = calculateSeverity(predictions);

    // Annotate image with bounding boxes if detections exist
    let annotatedImage = null;
    if (predictions.length > 0) {
      try {
        annotatedImage = await drawBoundingBoxes(imageBuffer, predictions);
      } catch (err) {
        console.error('Failed to draw bounding boxes:', err);
      }
    }

    return {
      detected: predictions.length > 0,
      predictions: predictions,
      suggestedSeverity: suggestedSeverity,
      detectionCount: predictions.length,
      annotatedImage: annotatedImage // Base64 string of annotated image
    };

  } catch (error) {
    console.error('Roboflow API Error:', error.response?.data || error.message);
    throw new Error('Failed to analyze image with AI');
  }
}

/**
 * Draw bounding boxes on the image
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Array} predictions - Detection predictions
 * @returns {Promise<string>} Base64 string of annotated image
 */
async function drawBoundingBoxes(imageBuffer, predictions) {
  const image = await loadImage(imageBuffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Draw original image
  ctx.drawImage(image, 0, 0);

  // Draw bounding boxes
  predictions.forEach((prediction) => {
    const { x, y, width, height, confidence, class: label } = prediction;

    // Convert center x,y to top-left x,y
    const xPos = x - width / 2;
    const yPos = y - height / 2;

    // Box settings
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = Math.max(2, image.width / 300); // Dynamic line width
    ctx.strokeRect(xPos, yPos, width, height);

    // Label settings
    const fontSize = Math.max(12, image.width / 50);
    ctx.font = `bold ${fontSize}px Arial`;
    const text = `${label} ${Math.round(confidence * 100)}%`;
    const textMetrics = ctx.measureText(text);

    // Label background
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(xPos, yPos - fontSize - 4, textMetrics.width + 8, fontSize + 6);

    // Label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, xPos + 4, yPos - 4);
  });

  // Return as data URL (base64)
  return canvas.toDataURL('image/jpeg');
}

/**
 * Calculate severity based on detection results
 * Uses pothole size (bounding box area) and count to estimate severity
 * @param {Array} predictions - Array of detection predictions from Roboflow
 * @returns {string} Suggested severity level: 'low', 'medium', 'high', 'critical'
 */
function calculateSeverity(predictions) {
  if (predictions.length === 0) {
    return 'low';
  }

  // Calculate average confidence
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

  // Calculate average area (width * height) as a proxy for pothole size
  const areas = predictions.map(p => p.width * p.height);
  const avgArea = areas.reduce((sum, area) => sum + area, 0) / areas.length;
  const maxArea = Math.max(...areas);

  const count = predictions.length;

  // Critical: Many potholes OR very large single pothole
  if (count >= 10 || maxArea > 2000) {
    return 'high';
  }

  // High: Multiple potholes with decent size
  if (count >= 5 || maxArea > 1000) {
    return 'high';
  }

  // Medium: Few potholes with moderate size
  if (count >= 2 || avgArea > 500) {
    return 'medium';
  }

  // Low: Single small pothole
  return 'low';
}

/**
 * Get the highest confidence detection from predictions
 * @param {Array} predictions - Array of detection predictions
 * @returns {Object|null} Prediction with highest confidence
 */
function getBestDetection(predictions) {
  if (predictions.length === 0) return null;

  return predictions.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  );
}

module.exports = {
  detectPothole,
  calculateSeverity,
  getBestDetection
};
