import { useState } from 'react';
import './AuthForms.css';

function CitizenLogin({ onNavigate, onLoginSuccess }) {
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
      const response = await fetch('http://localhost:5000/api/citizen/login', {
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
        localStorage.setItem('userType', 'citizen');
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(data.user, 'citizen');
        }
        
        // Navigate to citizen dashboard
        onNavigate('citizen-dashboard');
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
          <div className="auth-header">
            <h1>Citizen Login</h1>
            <p>Access your pothole reporting dashboard</p>
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
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? 
              <button 
                className="link-button" 
                onClick={() => onNavigate('citizen-register')}
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
          <div className="info-card">
            <h3>🌟 Welcome Back!</h3>
            <p>Continue reporting potholes and making your city safer.</p>
          </div>
          
          <div className="info-card">
            <h3>📊 Your Impact</h3>
            <ul className="impact-list">
              <li>Track your reported potholes</li>
              <li>Earn points and badges</li>
              <li>View resolution status</li>
              <li>Contribute to community safety</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenLogin;
