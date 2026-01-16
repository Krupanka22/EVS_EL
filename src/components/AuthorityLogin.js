import { useState } from 'react';
import './AuthForms.css';

function AuthorityLogin({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/authority/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', 'authority');
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(data.user, 'authority');
        }
        
        // Navigate to authority dashboard
        onNavigate('authority-dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header authority-header">
            <h1>Authority Login</h1>
            <p>Access the administrative dashboard</p>
          </div>

          {error && (
            <div className="error-alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✉️</span>
                Official Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your official email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Authority'}
            </button>
          </form>

          <div className="auth-footer">
            <p>New authority member? 
              <button 
                className="link-button" 
                onClick={() => onNavigate('authority-register')}
              >
                Register here
              </button>
            </p>
            <button 
              className="link-button" 
              onClick={() => onNavigate('home')}
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="auth-sidebar">
          <div className="info-card authority-info">
            <h3>🏛️ Government Portal</h3>
            <p>Manage and resolve pothole reports efficiently.</p>
          </div>
          
          <div className="info-card authority-info">
            <h3>⚡ Quick Access</h3>
            <ul className="impact-list">
              <li>View pending reports</li>
              <li>Assign repair teams</li>
              <li>Track work progress</li>
              <li>Generate analytics</li>
            </ul>
          </div>

          <div className="info-card authority-info">
            <h3>🔐 Security Notice</h3>
            <p>All authority accounts require admin verification before activation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorityLogin;
