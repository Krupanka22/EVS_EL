import { useState } from 'react';
import './App.css';
import AuthorityDashboard from './components/AuthorityDashboard';
import AuthorityLogin from './components/AuthorityLogin';
import AuthorityRegister from './components/AuthorityRegister';
import CitizenDashboard from './components/CitizenDashboard';
import HomePage from './components/HomePage';
import MapView from './components/MapView';
import ReportPothole from './components/ReportPothole';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Handle login success
  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'report':
        return <ReportPothole onNavigate={setCurrentPage} />;
      case 'dashboard':
        // Regular dashboard shows citizen view (no auth needed)
        return <CitizenDashboard onNavigate={setCurrentPage} />;
      case 'authority-dashboard':
        // Authority dashboard requires authentication
        if (!isAuthenticated) {
          return <AuthorityLogin onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
        }
        return <AuthorityDashboard onNavigate={setCurrentPage} />;
      case 'map':
        return <MapView onNavigate={setCurrentPage} />;
      case 'authority-login':
        return <AuthorityLogin onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
      case 'authority-register':
        return <AuthorityRegister onNavigate={setCurrentPage} onRegisterSuccess={handleLoginSuccess} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => setCurrentPage('home')}>
            <div className="logo-icon">🏙️</div>
            <div className="brand-text">
              <h1>SmartRoad</h1>
              <p>Pothole Detection & Reporting</p>
            </div>
          </div>

          <nav className="nav-menu">
            <button
              className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button
              className={currentPage === 'report' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('report')}
            >
              Report Pothole
            </button>
            <button
              className={currentPage === 'map' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('map')}
            >
              Map View
            </button>
            <button
              className={currentPage === 'dashboard' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="user-welcome">
                  👋 {currentUser?.name}
                </span>
                <button className="btn-profile" onClick={handleLogout}>
                  <span className="profile-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setCurrentPage('authority-login')}
                >
                  Authority Login
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SmartRoad Platform</h3>
            <p>Empowering citizens to build safer roads together</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Emergency Contacts</h4>
            <p>Road Safety: 1800-XXX-XXXX</p>
            <p>Municipal Office: 1800-YYY-YYYY</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SmartRoad - Smart City Initiative | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
