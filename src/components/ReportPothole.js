import { useEffect, useRef, useState, useCallback } from 'react';
import './ReportPothole.css';
import * as aiService from '../services/aiService';
import BoundingBoxOverlay from './BoundingBoxOverlay';

const DESCRIPTION_LIMIT = 500;

function ReportPothole({ onNavigate }) {
  const [formData, setFormData] = useState({
    location: '',
    latitude: null,
    longitude: null,
    severity: 'medium',
    description: '',
    photos: []
  });
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [autoLocateAttempted, setAutoLocateAttempted] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Attempt auto-locate once on load (permission gated by browser)
  useEffect(() => {
    if (!autoLocateAttempted) {
      setAutoLocateAttempted(true);
      getCurrentLocation().catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLocateAttempted]);

  // Get GPS location and return coordinates
  const getLocationData = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding using OpenStreetMap Nominatim API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            resolve({ latitude, longitude, address });
          } catch (error) {
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          }
        },
        (error) => {
          reject('Unable to get location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };



  // Get current GPS location for form
  const getCurrentLocation = useCallback(async () => {
    setIsCapturingLocation(true);
    setLocationError('');

    try {
      const locationData = await getLocationData();
      setFormData(prev => ({
        ...prev,
        location: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }));
      setIsCapturingLocation(false);
    } catch (error) {
      setLocationError(error);
      setIsCapturingLocation(false);
    }
  }, []);

  const getDetectionSeed = () => ({
    status: 'queued',
    label: 'Pothole',
    confidence: null,
    predictions: [],
    suggestedSeverity: null,
  });

  // Real AI detection using Roboflow
  const detectPothole = async (photoId, imageFile) => {
    setAiStatus('processing');
    try {
      // Call backend detection API
      const result = await aiService.analyzeImage(imageFile);

      // If annotated image returned, convert to blob for submission
      let annotatedFile = null;
      if (result.annotatedImage) {
        try {
          const base64Response = await fetch(result.annotatedImage);
          const blob = await base64Response.blob();
          // Use original filename if possible, or default
          const filename = imageFile.name || `annotated-${Date.now()}.jpg`;
          annotatedFile = new File([blob], filename, { type: 'image/jpeg' });
        } catch (e) {
          console.error('Failed to convert annotated image:', e);
        }
      }

      // Update photo with AI results
      setFormData(prev => {
        // Auto-suggest severity
        if (result.detected && result.suggestedSeverity && !prev.severityManuallySet) {
          setTimeout(() => {
            setFormData(current => ({
              ...current,
              severity: result.suggestedSeverity
            }));
          }, 100);
        }

        return {
          ...prev,
          photos: prev.photos.map(photo => {
            if (photo.id !== photoId) return photo;

            return {
              ...photo,
              // Update URL to annotated image if available
              url: result.annotatedImage || photo.url,
              // Update file to annotated file if available
              file: annotatedFile || photo.file,
              detection: {
                status: result.detected ? 'detected' : 'not-detected',
                label: result.detected ? 'Pothole' : 'No pothole found',
                confidence: result.predictions.length > 0 ? result.predictions[0].confidence : null,
                predictions: result.predictions,
                detectionCount: result.detectionCount,
                suggestedSeverity: result.suggestedSeverity
              }
            };
          })
        };
      });
      setAiStatus('idle');
    } catch (error) {
      console.error('Detection error:', error);
      // Update photo with error status
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.map(photo => {
          if (photo.id !== photoId) return photo;
          return {
            ...photo,
            detection: {
              status: 'error',
              label: 'Detection failed',
              confidence: null,
              error: error.message
            }
          };
        })
      }));
      setAiStatus('idle');
    }
  };

  // Handle camera capture with GPS
  const handleCameraCapture = async (e) => {
    const files = Array.from(e.target.files);

    // Get GPS location when photo is taken
    let locationData = null;
    try {
      locationData = await getLocationData();
    } catch (error) {
      console.error('Could not get location for photo:', error);
    }

    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoId = Date.now() + Math.random();
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, {
              id: photoId,
              url: event.target.result,
              file: file,
              name: file.name,
              latitude: locationData?.latitude || null,
              longitude: locationData?.longitude || null,
              address: locationData?.address || 'Location not available',
              timestamp: new Date().toLocaleString(),
              detection: getDetectionSeed()
            }]
          }));
          detectPothole(photoId, file);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove photo
  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  // Open camera
  const openCamera = async () => {
    try {
      let mediaStream;

      // Try to get camera - will use front camera on laptops
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user' // Front camera for laptops/desktops
          },
          audio: false
        });
      } catch (error) {
        // Fallback to rear camera if front camera fails (mobile devices)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      }

      setStream(mediaStream);
      setIsCameraOpen(true);

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use "Choose from Gallery" instead.');
    }
  };

  // Close camera
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setStream(null);
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;

    // Check if video is ready and has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      alert('Camera is still loading. Please wait a moment and try again.');
      return;
    }

    // Get GPS location
    let locationData = null;
    try {
      locationData = await getLocationData();
    } catch (error) {
      console.error('Could not get location for photo:', error);
    }

    // Capture image from video
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob((blob) => {
      const photoId = Date.now() + Math.random();
      const url = URL.createObjectURL(blob);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, {
          id: photoId,
          url: url,
          file: blob,
          name: `camera-${Date.now()}.jpg`,
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          address: locationData?.address || 'Location not available',
          timestamp: new Date().toLocaleString(),
          detection: getDetectionSeed()
        }]
      }));
      detectPothole(photoId, blob);
    }, 'image/jpeg', 0.95);

    closeCamera();
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="report-pothole">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <h1>Report a Pothole</h1>
          <p>Help us identify and fix road hazards quickly</p>
        </div>

        <div className="status-banner">
          <div className={`status-chip ${formData.latitude ? 'ok' : 'warn'}`}>
            <span className="chip-icon">📍</span>
            {formData.latitude ? 'GPS pinned automatically' : 'Allow location to auto-pin your report'}
          </div>
          <div className={`status-chip ${aiStatus === 'processing' ? 'busy' : 'ok'}`}>
            <span className="chip-icon">🤖</span>
            {aiStatus === 'processing' ? 'AI scan in progress…' : 'AI-ready: scans photos for potholes'}
          </div>
          <div className="status-chip neutral">
            <span className="chip-icon">🖼️</span>
            {formData.photos.length} photo{formData.photos.length === 1 ? '' : 's'} attached
          </div>
        </div>

        {/* Report Form */}
        <div className="report-content">
          <div className="form-section">
            <form className="report-form">
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📸</span>
                  Upload Photo
                  <span className="label-required">*</span>
                </label>

                {/* Camera and Upload Buttons */}
                <div className="camera-controls">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCamera}
                  >
                    <span className="btn-icon">📷</span>
                    Take Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={openFilePicker}
                  >
                    <span className="btn-icon">🖼️</span>
                    Choose from Gallery
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  className="file-input-hidden"
                  accept="image/*"
                  capture="user"
                  onChange={handleCameraCapture}
                  style={{ display: 'none' }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input-hidden"
                  accept="image/*"
                  multiple
                  onChange={handleCameraCapture}
                  style={{ display: 'none' }}
                />

                {/* Image Preview Grid */}
                {formData.photos.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.photos.map(photo => (
                      <div key={photo.id} className="preview-item" style={{ position: 'relative' }}>
                        <img src={photo.url} alt={photo.name} className="preview-image" />

                        {/* AI Bounding Box Overlay */}
                        {photo.detection && photo.detection.predictions && photo.detection.predictions.length > 0 && (
                          <BoundingBoxOverlay
                            imageUrl={photo.url}
                            predictions={photo.detection.predictions}
                          />
                        )}

                        {photo.detection && (
                          <div className={`ai-badge status-${photo.detection.status}`}>
                            <span className="ai-dot"></span>
                            {photo.detection.status === 'detected'
                              ? `AI: ${photo.detection.label} · ${Math.round((photo.detection.confidence || 0) * 100)}%`
                              : 'AI: queued'}
                          </div>
                        )}

                        {/* Photo Location Info */}
                        {photo.address && (
                          <div className="photo-location-badge">
                            <span className="location-icon-small">📍</span>
                            <span className="location-text">{photo.address.split(',')[0]}</span>
                          </div>
                        )}

                        {/* Photo Details Tooltip */}
                        <div className="photo-details">
                          {photo.timestamp && (
                            <div className="photo-detail-row">
                              <span>🕐 {photo.timestamp}</span>
                            </div>
                          )}
                          {photo.latitude && photo.longitude && (
                            <div className="photo-detail-row">
                              <span>📍 {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}</span>
                            </div>
                          )}
                          {photo.address && (
                            <div className="photo-detail-row">
                              <span>📌 {photo.address}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removePhoto(photo.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.photos.length === 0 && (
                  <div className="upload-hint-box">
                    <p>No photos added yet. Use camera or upload from gallery.</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📍</span>
                  Location
                  <span className="label-required">*</span>
                </label>
                <div className="location-input-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter street address or landmark"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={getCurrentLocation}
                    disabled={isCapturingLocation}
                  >
                    {isCapturingLocation ? (
                      <span>🔄 Getting Location...</span>
                    ) : (
                      <span>📍 Use Current Location</span>
                    )}
                  </button>
                </div>

                {locationError && (
                  <div className="error-message">
                    ⚠️ {locationError}
                  </div>
                )}

                {formData.latitude && formData.longitude && (
                  <div className="gps-info">
                    <span className="gps-label">GPS Coordinates:</span>
                    <span className="gps-coords">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </span>
                  </div>
                )}

                <div className="map-preview">
                  <div className="map-placeholder">
                    <span>🗺️ Map Preview</span>
                    <p>{formData.location || 'Location will be shown here'}</p>
                  </div>
                </div>
              </div>

              {/* Severity Level */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⚠️</span>
                  Severity Level
                  <span className="label-required">*</span>
                </label>
                <div className="severity-options">
                  <label className="severity-option low">
                    <input
                      type="radio"
                      name="severity"
                      value="low"
                      checked={formData.severity === 'low'}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    />
                    <div className="severity-card">
                      <div className="severity-icon">●</div>
                      <div className="severity-info">
                        <strong>Low</strong>
                        <span>Minor surface damage</span>
                      </div>
                    </div>
                  </label>
                  <label className="severity-option medium">
                    <input
                      type="radio"
                      name="severity"
                      value="medium"
                      checked={formData.severity === 'medium'}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    />
                    <div className="severity-card">
                      <div className="severity-icon">●</div>
                      <div className="severity-info">
                        <strong>Medium</strong>
                        <span>Noticeable hole, caution needed</span>
                      </div>
                    </div>
                  </label>
                  <label className="severity-option high">
                    <input
                      type="radio"
                      name="severity"
                      value="high"
                      checked={formData.severity === 'high'}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    />
                    <div className="severity-card">
                      <div className="severity-icon">●</div>
                      <div className="severity-info">
                        <strong>High</strong>
                        <span>Dangerous, immediate attention</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Description
                  <span className="label-optional">(Optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide additional details about the pothole (size, traffic impact, nearby landmarks...)"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
                <div className="character-count">{formData.description.length} / {DESCRIPTION_LIMIT}</div>
              </div>

              {/* Additional Information */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">ℹ️</span>
                  Additional Information
                </label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Multiple potholes in this area</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Traffic safety hazard</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Water accumulation present</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onNavigate('home')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-large">
                  <span className="btn-icon">📤</span>
                  Submit Report
                </button>
              </div>
            </form>
          </div>

          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="camera-modal">
              <div className="camera-container">
                <div className="camera-header">
                  <h3>📷 Take Photo</h3>
                  <button
                    type="button"
                    className="btn-close-camera"
                    onClick={closeCamera}
                  >
                    ✕
                  </button>
                </div>
                <div className="camera-preview">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-video"
                  />
                </div>
                <div className="camera-controls">
                  <button
                    type="button"
                    className="btn btn-primary btn-large"
                    onClick={capturePhoto}
                  >
                    <span className="btn-icon">📸</span>
                    Capture Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Info Sidebar */}
          <div className="info-sidebar">
            <div className="info-card">
              <h3>📋 Reporting Guidelines</h3>
              <ul className="guidelines-list">
                <li>Take clear photos showing the pothole</li>
                <li>Include nearby landmarks for reference</li>
                <li>Provide accurate location details</li>
                <li>Report only genuine road hazards</li>
              </ul>
            </div>

            <div className="info-card ai-ready">
              <h3>🤖 AI Detection Ready</h3>
              <p>Uploaded photos are queued for AI-assisted detection. The current build simulates results so you can design the workflow now and plug in a model later.</p>
              <div className="ai-pill-row">
                <span className="ai-pill">Model slot: TBD</span>
                <span className="ai-pill">Confidence output</span>
                <span className="ai-pill">Severity tagging</span>
              </div>
              <div className="ai-metrics">
                <div>
                  <span className="metric-label">Scans</span>
                  <strong>{formData.photos.length}</strong>
                </div>
                <div>
                  <span className="metric-label">Status</span>
                  <strong>{aiStatus === 'processing' ? 'Running' : 'Idle'}</strong>
                </div>
                <div>
                  <span className="metric-label">GPS</span>
                  <strong>{formData.latitude ? 'Locked' : 'Pending'}</strong>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>⏱️ What Happens Next?</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>Immediate</strong>
                    <p>Report logged in system</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>24 Hours</strong>
                    <p>Authority review & verification</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>3-7 Days</strong>
                    <p>Repair work scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card success">
              <div className="stat-highlight">
                <div className="stat-number">0</div>
                <div className="stat-text">Start reporting to help fix potholes in your area!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPothole;
