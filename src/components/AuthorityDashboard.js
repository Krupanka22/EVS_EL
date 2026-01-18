import { useState, useEffect } from 'react';
import './AuthorityDashboard.css';
import { BarChart3, Users, Eye, Check, UserPlus, X, MapPin, ThumbsUp } from 'lucide-react';

function AuthorityDashboard({ onNavigate }) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [reports, setReports] = useState({
    pending: [],
    inProgress: [],
    resolved: []
  });

  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/reports`);
        const result = await response.json();

        if (result.success) {
          const allReports = result.data;
          const pending = allReports.filter(r => r.status === 'reported').map(formatReport);
          const inProgress = allReports.filter(r => r.status === 'in-progress').map(formatReport);
          const resolved = allReports.filter(r => r.status === 'resolved').map(formatReport);

          setReports({ pending, inProgress, resolved });
          setStats({
            pending: pending.length,
            inProgress: inProgress.length,
            resolved: resolved.length
          });
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const formatReport = (r) => ({
    id: r._id.substring(r._id.length - 6),
    location: r.location,
    severity: r.severity,
    reportedBy: r.userType === 'citizen' ? 'Citizen' : 'Authority',
    date: new Date(r.createdAt).toLocaleDateString(),
    votes: r.votes || 0,
    status: r.status,
    assignedTo: 'Unassigned', // Backend doesn't support assignment yet
    eta: 'TBD',
    resolvedDate: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-'
  });

  return (
    <div className="authority-dashboard">
      <div className="authority-container">
        {/* Header */}
        <div className="authority-header">
          <div className="header-left">
            <h1>Authority Dashboard</h1>
            <p>Municipal Road Maintenance Department</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <BarChart3 size={18} />
              Generate Report
            </button>
            <button className="btn btn-primary">
              <Users size={18} />
              Assign Teams
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="authority-stats">
          <div className="authority-stat-card pending">
            <div className="stat-header">
              <span className="stat-icon">⚠️</span>
              <h3>Pending Review</h3>
            </div>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-footer">
              <span className="stat-trend up">Awaiting review</span>
            </div>
          </div>
          <div className="authority-stat-card progress">
            <div className="stat-header">
              <span className="stat-icon">🔧</span>
              <h3>In Progress</h3>
            </div>
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-footer">
              <span className="stat-trend">No teams deployed</span>
            </div>
          </div>
          <div className="authority-stat-card resolved">
            <div className="stat-header">
              <span className="stat-icon">✓</span>
              <h3>Resolved (This Month)</h3>
            </div>
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-footer">
              <span className="stat-trend up">Start resolving reports</span>
            </div>
          </div>
          <div className="authority-stat-card info">
            <div className="stat-header">
              <span className="stat-icon">⏱️</span>
              <h3>Avg Response Time</h3>
            </div>
            <div className="stat-number">--</div>
            <div className="stat-footer">
              <span className="stat-trend down">No data</span>
            </div>
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="priority-alerts">
          <div className="alert-card urgent">
            <div className="alert-icon">🚨</div>
            <div className="alert-content">
              <strong>3 High Priority Reports</strong>
              <p>Require immediate attention - Safety hazard detected</p>
            </div>
            <button className="btn btn-danger btn-small">Review Now</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={selectedTab === 'pending' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setSelectedTab('pending')}
            >
              Pending Reports ({reports.pending.length})
            </button>
            <button
              className={selectedTab === 'inProgress' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setSelectedTab('inProgress')}
            >
              In Progress ({reports.inProgress.length})
            </button>
            <button
              className={selectedTab === 'resolved' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setSelectedTab('resolved')}
            >
              Resolved ({reports.resolved.length})
            </button>
          </div>

          {/* Reports Table */}
          <div className="reports-table-container">
            <div className="table-actions">
              <input
                type="text"
                className="search-input"
                placeholder="Search by location, ID, or reporter..."
              />
              <select className="filter-select">
                <option>All Severity</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="filter-select">
                <option>Sort by Date</option>
                <option>Sort by Severity</option>
                <option>Sort by Votes</option>
              </select>
            </div>

            {/* Pending Reports */}
            {selectedTab === 'pending' && (
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Reported By</th>
                      <th>Date</th>
                      <th>Votes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.pending.map(report => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td className="location-cell">
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {report.location}
                        </td>
                        <td>
                          <span className={`severity-badge severity-${report.severity}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td>{report.reportedBy}</td>
                        <td>{report.date}</td>
                        <td>
                          <span className="votes-badge">{report.votes} <ThumbsUp size={14} style={{ display: 'inline' }} /></span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action view"><Eye size={16} /></button>
                            <button className="btn-action approve"><Check size={16} /></button>
                            <button className="btn-action assign"><UserPlus size={16} /></button>
                            <button className="btn-action reject"><X size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* In Progress Reports */}
            {selectedTab === 'inProgress' && (
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Assigned To</th>
                      <th>ETA</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.inProgress.map(report => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td className="location-cell">
                          <span className="location-icon">📍</span>
                          {report.location}
                        </td>
                        <td>
                          <span className={`severity-badge severity-${report.severity}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td>
                          <span className="team-badge">{report.assignedTo}</span>
                        </td>
                        <td>{report.eta}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action view">👁️</button>
                            <button className="btn-action complete">✓ Complete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resolved Reports */}
            {selectedTab === 'resolved' && (
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Reported Date</th>
                      <th>Resolved Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.resolved.map(report => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td className="location-cell">
                          <span className="location-icon">📍</span>
                          {report.location}
                        </td>
                        <td>
                          <span className={`severity-badge severity-${report.severity}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td>{report.date}</td>
                        <td>
                          <span className="resolved-date">{report.resolvedDate}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action view">👁️</button>
                            <button className="btn-action archive">📁 Archive</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <div className="analytics-card">
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Resolution Rate</div>
                <div className="metric-value">87%</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Citizen Satisfaction</div>
                <div className="metric-value">4.6/5</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Team Status</h3>
            <div className="team-list">
              <div className="team-item">
                <span className="team-name">Team A</span>
                <span className="team-status active">Active</span>
                <span className="team-assignments">3 assignments</span>
              </div>
              <div className="team-item">
                <span className="team-name">Team B</span>
                <span className="team-status active">Active</span>
                <span className="team-assignments">2 assignments</span>
              </div>
              <div className="team-item">
                <span className="team-name">Team C</span>
                <span className="team-status available">Available</span>
                <span className="team-assignments">0 assignments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorityDashboard;
