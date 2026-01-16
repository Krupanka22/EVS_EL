import './CitizenDashboard.css';

function CitizenDashboard({ onNavigate }) {
  const myReports = [];

  const getStatusClass = (status) => {
    switch(status) {
      case 'resolved': return 'status-resolved';
      case 'in-progress': return 'status-progress';
      case 'reported': return 'status-reported';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'resolved': return '✓ Resolved';
      case 'in-progress': return '🔧 In Progress';
      case 'reported': return '⚠️ Reported';
      default: return status;
    }
  };

  return (
    <div className="citizen-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>My Dashboard</h1>
            <p>Track your reports and community impact</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('report')}>
            <span className="btn-icon">➕</span>
            New Report
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">📊</div>
            <div className="stat-data">
              <div className="stat-number">0</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">✅</div>
            <div className="stat-data">
              <div className="stat-number">0</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-data">
              <div className="stat-number">0</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">⭐</div>
            <div className="stat-data">
              <div className="stat-number">0</div>
              <div className="stat-label">Impact Points</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* My Reports Section */}
          <div className="dashboard-section reports-section">
            <div className="section-header">
              <h2>My Reports</h2>
              <div className="section-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Reported</button>
                <button className="filter-btn">In Progress</button>
                <button className="filter-btn">Resolved</button>
              </div>
            </div>

            <div className="reports-list">
              {myReports.map(report => (
                <div key={report.id} className="report-card">
                  <div className="report-header-row">
                    <div className="report-id">#{report.id}</div>
                    <div className={`report-status ${getStatusClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </div>
                  </div>
                  <div className="report-location">
                    <span className="location-icon">📍</span>
                    {report.location}
                  </div>
                  <div className="report-footer">
                    <span className="report-date">🕐 {report.date}</span>
                    <span className={`report-severity severity-${report.severity}`}>
                      Severity: {report.severity}
                    </span>
                  </div>
                  <div className="report-actions">
                    <button className="btn-text">View Details</button>
                    <button className="btn-text">Track Status</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity & Achievements */}
          <div className="dashboard-sidebar">
            {/* Recent Activity */}
            <div className="sidebar-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon success">✓</div>
                  <div className="activity-content">
                    <p><strong>Report #1 Resolved</strong></p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon warning">🔧</div>
                  <div className="activity-content">
                    <p><strong>Report #2 Under Repair</strong></p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon info">📤</div>
                  <div className="activity-content">
                    <p><strong>New Report Submitted</strong></p>
                    <span className="activity-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="sidebar-card achievements">
              <h3>Achievements</h3>
              <div className="achievement-grid">
                <div className="achievement-badge earned">
                  <div className="badge-icon">🌟</div>
                  <span>First Report</span>
                </div>
                <div className="achievement-badge earned">
                  <div className="badge-icon">🏆</div>
                  <span>5 Reports</span>
                </div>
                <div className="achievement-badge earned">
                  <div className="badge-icon">💫</div>
                  <span>Quick Reporter</span>
                </div>
                <div className="achievement-badge locked">
                  <div className="badge-icon">🎯</div>
                  <span>10 Reports</span>
                </div>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="sidebar-card impact-card">
              <h3>Your Impact</h3>
              <div className="impact-stats">
                <div className="impact-item">
                  <div className="impact-number">0</div>
                  <div className="impact-text">Roads Fixed</div>
                </div>
                <div className="impact-item">
                  <div className="impact-number">0</div>
                  <div className="impact-text">Citizens Helped</div>
                </div>
              </div>
              <div className="impact-message">
                <p>🎉 Your reports will help make roads safer!</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="sidebar-card">
              <h3>Community Leaderboard</h3>
              <div className="leaderboard-list">
                <div className="leaderboard-item">
                  <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>No data available yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenDashboard;
