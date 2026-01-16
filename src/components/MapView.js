import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import './MapView.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const markerIcons = {
  reported: createCustomIcon('#dc3545'),
  'in-progress': createCustomIcon('#ffc107'),
  resolved: createCustomIcon('#28a745'),
};

// Component to handle map view changes
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

function MapView({ onNavigate }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore coordinates
  const [mapZoom, setMapZoom] = useState(13);

  const [potholes] = useState([
    {
      id: 'P-1023',
      lat: 12.9735,
      lng: 77.605,
      status: 'reported',
      severity: 'high',
      location: 'MG Road, Church Street Junction',
      date: 'Jan 15, 2026',
      detectedBy: 'AI',
      confidence: 0.91,
      distance: '~0.6 km'
    },
    {
      id: 'P-0998',
      lat: 12.965,
      lng: 77.595,
      status: 'in-progress',
      severity: 'medium',
      location: 'Richmond Road near flyover',
      date: 'Jan 13, 2026',
      detectedBy: 'Citizen',
      confidence: 0.0,
      distance: '~1.0 km'
    },
    {
      id: 'P-0950',
      lat: 12.982,
      lng: 77.59,
      status: 'resolved',
      severity: 'low',
      location: 'Ulsoor Lake Loop Road',
      date: 'Jan 10, 2026',
      detectedBy: 'AI',
      confidence: 0.88,
      distance: '~1.4 km'
    },
    {
      id: 'P-1042',
      lat: 12.968,
      lng: 77.608,
      status: 'reported',
      severity: 'medium',
      location: 'Indiranagar 100ft Road',
      date: 'Jan 16, 2026',
      detectedBy: 'Citizen',
      confidence: 0.0,
      distance: '~2.1 km'
    }
  ]);

  const totals = {
    reported: potholes.filter(p => p.status === 'reported').length,
    inProgress: potholes.filter(p => p.status === 'in-progress').length,
    resolved: potholes.filter(p => p.status === 'resolved').length,
  };

  const filteredPotholes = potholes.filter(
    p => selectedFilter === 'all' || p.status === selectedFilter
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(14);
      });
    }
  }, []);

  const handleSelectPothole = (pothole) => {
    setSelectedPothole(pothole.id);
    setMapCenter([pothole.lat, pothole.lng]);
    setMapZoom(16);
  };

  const getMarkerClass = (status) => {
    switch(status) {
      case 'resolved': return 'marker-resolved';
      case 'in-progress': return 'marker-progress';
      case 'reported': return 'marker-reported';
      default: return '';
    }
  };

  return (
    <div className="map-view">
      <div className="map-container">
        {/* Map Controls */}
        <div className="map-controls">
          <div className="control-panel">
            <h2>Filter by Status</h2>
            <div className="filter-buttons">
              <button 
                className={selectedFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setSelectedFilter('all')}
              >
                <span className="filter-icon">📍</span>
                All ({potholes.length})
              </button>
              <button 
                className={selectedFilter === 'reported' ? 'filter-btn reported active' : 'filter-btn reported'}
                onClick={() => setSelectedFilter('reported')}
              >
                <span className="filter-icon">⚠️</span>
                Reported ({totals.reported})
              </button>
              <button 
                className={selectedFilter === 'in-progress' ? 'filter-btn progress active' : 'filter-btn progress'}
                onClick={() => setSelectedFilter('in-progress')}
              >
                <span className="filter-icon">🔧</span>
                In Progress ({totals.inProgress})
              </button>
              <button 
                className={selectedFilter === 'resolved' ? 'filter-btn resolved active' : 'filter-btn resolved'}
                onClick={() => setSelectedFilter('resolved')}
              >
                <span className="filter-icon">✓</span>
                Resolved ({totals.resolved})
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="map-legend">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-marker marker-reported"></div>
                <span>Reported</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker marker-progress"></div>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker marker-resolved"></div>
                <span>Resolved</span>
              </div>
            </div>
          </div>

          {/* Map Stats */}
          <div className="map-stats">
            <div className="stat-box">
              <div className="stat-num">{potholes.length}</div>
              <div className="stat-text">Reports This Week</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{totals.reported + totals.inProgress}</div>
              <div className="stat-text">Need Attention Nearby</div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="map-area">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%', borderRadius: '15px' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewController center={mapCenter} zoom={mapZoom} />
            
            {/* Render pothole markers */}
            {filteredPotholes
              .map(pothole => (
                <Marker
                  key={pothole.id}
                  position={[pothole.lat, pothole.lng]}
                  icon={markerIcons[pothole.status]}
                  eventHandlers={{
                    click: () => handleSelectPothole(pothole)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <strong>{pothole.location}</strong>
                      <br />
                      <span>Status: {pothole.status}</span>
                      <br />
                      <span>Severity: {pothole.severity}</span>
                      <br />
                      <span>Date: {pothole.date}</span>
                      <br />
                      {pothole.detectedBy === 'AI' && (
                        <span>AI confidence: {Math.round((pothole.confidence || 0) * 100)}%</span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="map-tools">
            <button className="map-tool-btn" onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))} title="Zoom In">+</button>
            <button className="map-tool-btn" onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))} title="Zoom Out">−</button>
            <button 
              className="map-tool-btn" 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(15);
                  });
                }
              }}
              title="My Location"
            >
              📍
            </button>
          </div>
          
          {/* Pothole Details Panel */}
          {selectedPothole && (
            <div className="pothole-details">
              <button className="close-btn" onClick={() => setSelectedPothole(null)}>✕</button>
              <h3>Pothole Details</h3>
              <div className="details-content">
                {potholes
                  .filter(p => p.id === selectedPothole)
                  .map(pothole => (
                    <div key={pothole.id}>
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{pothole.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-badge ${getMarkerClass(pothole.status)}`}>
                          {pothole.status}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Severity:</span>
                        <span className="detail-value">{pothole.severity}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Reported:</span>
                        <span className="detail-value">{pothole.date}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Detected By:</span>
                        <span className="detail-value">{pothole.detectedBy}</span>
                      </div>
                      {pothole.detectedBy === 'AI' && (
                        <div className="detail-row">
                          <span className="detail-label">AI Confidence:</span>
                          <span className="detail-value">{Math.round((pothole.confidence || 0) * 100)}%</span>
                        </div>
                      )}
                      <div className="detail-actions">
                        <button className="btn btn-secondary btn-small">View Photos</button>
                        <button className="btn btn-primary btn-small">Get Directions</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Nearby Potholes List */}
        <div className="nearby-list">
          <h3>Nearby Potholes</h3>
          <div className="nearby-items">
            {filteredPotholes.slice(0, 4).map(pothole => (
              <div 
                key={pothole.id}
                className="nearby-item"
                onClick={() => handleSelectPothole(pothole)}
              >
                <div className={`nearby-status ${getMarkerClass(pothole.status)}`}></div>
                <div className="nearby-info">
                  <strong>{pothole.location}</strong>
                  <span className="nearby-distance">{pothole.distance}</span>
                </div>
                <button className="btn-arrow">→</button>
              </div>
            ))}
          </div>
          <button className="btn btn-text view-all">View All Reports</button>
        </div>
      </div>
    </div>
  );
}

export default MapView;
