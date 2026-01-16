import { useState } from 'react';
import './AuthForms.css';

function AuthorityRegister({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    designation: '',
    employeeId: '',
    city: '',
    state: '',
    zone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const departments = [
    'Municipal Corporation',
    'Public Works Department',
    'Road Maintenance',
    'City Administration',
    'Other'
  ];

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

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/authority/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          department: formData.department,
          designation: formData.designation,
          employeeId: formData.employeeId,
          city: formData.city,
          state: formData.state,
          zone: formData.zone
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Show success message and redirect to login after 3 seconds
        setTimeout(() => {
          onNavigate('authority-login');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card success-card">
            <div className="success-icon">✅</div>
            <h2>Registration Successful!</h2>
            <p>Your account has been created successfully.</p>
            <p className="verification-notice">
              <strong>⏳ Pending Verification</strong><br/>
              Your account will be activated once verified by the administrator. 
              You will receive an email notification when your account is approved.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => onNavigate('authority-login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header authority-header">
            <h1>Authority Registration</h1>
            <p>Register as a government authority member</p>
          </div>

          {error && (
            <div className="error-alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🆔</span>
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  placeholder="Enter employee ID"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">✉️</span>
                  Official Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="official.email@gov.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏛️</span>
                  Department
                </label>
                <select
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💼</span>
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  className="form-input"
                  placeholder="e.g., Engineer, Officer"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏙️</span>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🗺️</span>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📍</span>
                Zone/Area (Optional)
              </label>
              <input
                type="text"
                name="zone"
                className="form-input"
                placeholder="e.g., Zone A, North District"
                value={formData.zone}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔒</span>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            <div className="info-notice">
              <strong>📋 Important:</strong> Your account will require admin verification before activation. 
              Please ensure all information is accurate.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already registered? 
              <button 
                className="link-button" 
                onClick={() => onNavigate('authority-login')}
              >
                Login here
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
      </div>
    </div>
  );
}

export default AuthorityRegister;
