import './HomePage.css';
import { MapPin, Map as MapIcon, Camera, CheckCircle, Building2, LayoutDashboard, AlertTriangle, Settings } from 'lucide-react';

function HomePage({ onNavigate }) {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Building Safer Roads Together</h1>
            <p className="hero-subtitle">
              Report potholes instantly and help your city maintain better infrastructure.
              Join thousands of citizens making our roads safer.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => onNavigate('report')}>
                <MapPin size={18} />
                Report a Pothole
              </button>
              <button className="btn btn-secondary" onClick={() => onNavigate('map')}>
                <MapIcon size={18} />
                View Map
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Reports Submitted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Potholes Fixed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue"><Camera size={32} /></div>
            <h3>1. Capture</h3>
            <p>Take a photo of the pothole using your smartphone camera</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue"><MapPin size={32} /></div>
            <h3>2. Report</h3>
            <p>Share location details and submit your report instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">🔔</div>
            <h3>3. Track</h3>
            <p>Monitor the status of your report in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green"><CheckCircle size={32} /></div>
            <h3>4. Resolved</h3>
            <p>Get notified when the pothole is fixed by authorities</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="impact-content">
          <h2 className="section-title">Our Impact</h2>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon"><Building2 size={32} /></div>
              <h3>Cities</h3>
              <p>Connected nationwide</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">👥</div>
              <h3>Citizens</h3>
              <p>Active reporters</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">⚡</div>
              <h3>Response Time</h3>
              <p>Average response time</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon"><LayoutDashboard size={32} /></div>
              <h3>Roads</h3>
              <p>Roads repaired</p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Overview Section */}
      <section className="status-overview-section">
        <h2 className="section-title">Current Status Overview</h2>
        <div className="status-cards">
          <div className="status-card danger">
            <div className="status-header">
              <span className="status-icon"><AlertTriangle size={16} /></span>
              <h3>Reported</h3>
            </div>
            <div className="status-number">0</div>
            <div className="status-label">Pending Reports</div>
          </div>
          <div className="status-card warning">
            <div className="status-header">
              <span className="status-icon"><Settings size={16} /></span>
              <h3>In Progress</h3>
            </div>
            <div className="status-number">0</div>
            <div className="status-label">Under Repair</div>
          </div>
          <div className="status-card success">
            <div className="status-header">
              <span className="status-icon">✓</span>
              <h3>Resolved</h3>
            </div>
            <div className="status-number">0</div>
            <div className="status-label">Fixed This Month</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community and help build safer, better roads for everyone</p>
          <button className="btn btn-primary btn-large" onClick={() => onNavigate('report')}>
            Report Your First Pothole
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
