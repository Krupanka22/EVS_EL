import { useState, useEffect } from 'react';
import './CitizenDashboard.css';
import { BarChart3, CheckCircle, Clock, Star, MapPin, Image as ImageIcon, X, TrendingUp, Trophy, Target } from 'lucide-react';

function CitizenDashboard({ onNavigate }) {
  const [myReports, setMyReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    impact: 0
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/reports`);
      const result = await response.json();

      if (result.success) {
        const reports = result.data.map(r => ({
          id: r._id.substring(r._id.length - 6),
          status: r.status,
          location: r.location,
          date: new Date(r.createdAt).toLocaleDateString(),
          severity: r.severity,
          photos: r.photos || []
        }));

        setMyReports(reports);

        const total = reports.length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const inProgress = reports.filter(r => r.status === 'in-progress').length;
        const impact = (total * 10) + (resolved * 50);

        setStats({ total, resolved, inProgress, impact });
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved': return 'status-resolved';
      case 'in-progress': return 'status-progress';
      case 'reported': return 'status-reported';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in-progress': return 'In Progress';
      case 'reported': return 'Reported';
      default: return status;
    }
  };

  return (
    <div className="citizen-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>My Dashboard</h1>
            <p>Track your reports and community impact</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('report')}>
            <span className="btn-icon">+</span>
            New Report
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon"><BarChart3 size={24} /></div>
            <div className="stat-data">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon"><CheckCircle size={24} /></div>
            <div className="stat-data">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon"><Clock size={24} /></div>
            <div className="stat-data">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon"><Star size={24} /></div>
            <div className="stat-data">
              <div className="stat-number">{stats.impact}</div>
              <div className="stat-label">Impact Points</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section reports-section">
            <div className="section-header">
              <h2>My Reports</h2>
              <div className="section-filters">
                <button className={filter === 'all' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'reported' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('reported')}>Reported</button>
                <button className={filter === 'in-progress' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('in-progress')}>In Progress</button>
                <button className={filter === 'resolved' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('resolved')}>Resolved</button>
              </div>
            </div>

            <div className="reports-list">
              {myReports.filter(r => filter === 'all' || r.status === filter).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No reports found.
                </div>
              ) : (
                myReports.filter(r => filter === 'all' || r.status === filter).map(report => (
                  <div key={report.id} className="report-card-enhanced">
                    {/* Photo Thumbnail */}
                    {report.photos && report.photos.length > 0 && (
                      <div className="report-photo-thumbnail" onClick={() => setSelectedPhoto(report.photos[0]?.url)}>
                        <img src={report.photos[0]?.url} alt="Report" />
                        <div className="photo-overlay">
                          <ImageIcon size={20} />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="report-content">
                      <div className="report-header-row">
                        <div className={`report-status-badge status-${report.status}`}>
                          {getStatusLabel(report.status)}
                        </div>
                      </div>

                      <div className="report-location-text">
                        <MapPin size={14} />
                        <span>{report.location}</span>
                      </div>

                      <div className="report-meta">
                        <span className="report-date">
                          <Clock size={12} />
                          {report.date}
                        </span>
                        <span className={`severity-tag severity-${report.severity}`}>
                          {report.severity}
                        </span>
                      </div>

                      <div className="report-actions-compact">
                        <button className="btn-compact" onClick={() => setSelectedReport(report)}>
                          <TrendingUp size={14} />
                          Track Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="sidebar-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon info">ℹ️</div>
                  <div className="activity-content">
                    <p><strong>System Ready</strong></p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-card achievements">
              <h3>Achievements</h3>
              <div className="achievement-grid">
                <div className={`achievement-badge ${stats.total >= 1 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon"><Star size={24} /></div>
                  <span>First Report</span>
                </div>
                <div className={`achievement-badge ${stats.total >= 5 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon"><Trophy size={24} /></div>
                  <span>5 Reports</span>
                </div>
                <div className={`achievement-badge ${stats.total >= 10 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon"><Target size={24} /></div>
                  <span>10 Reports</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card impact-card">
              <h3>Your Impact</h3>
              <div className="impact-stats">
                <div className="impact-item">
                  <div className="impact-number">{stats.resolved}</div>
                  <div className="impact-text">Roads Fixed</div>
                </div>
                <div className="impact-item">
                  <div className="impact-number">0</div>
                  <div className="impact-text">Citizens Helped</div>
                </div>
              </div>
              <div className="impact-message">
                <p>Your reports will help make roads safer!</p>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Community Leaderboard</h3>
              <div className="leaderboard-list">
                <div className="leaderboard-item">
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No data available yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>
              <X size={24} />
            </button>
            <img src={selectedPhoto} alt="Report" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
          </div>
        </div>
      )}

      {/* Track Status Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReport(null)}>
              <X size={24} />
            </button>
            <h3>Report Status: #{selectedReport.id}</h3>
            <div style={{ marginTop: '20px' }}>
              <div className="status-timeline">
                <div className={`timeline-step ${selectedReport.status === 'reported' || selectedReport.status === 'in-progress' || selectedReport.status === 'resolved' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <div className="step-label">Reported</div>
                </div>
                <div className={`timeline-step ${selectedReport.status === 'in-progress' || selectedReport.status === 'resolved' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <div className="step-label">In Progress</div>
                </div>
                <div className={`timeline-step ${selectedReport.status === 'resolved' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <div className="step-label">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitizenDashboard;
