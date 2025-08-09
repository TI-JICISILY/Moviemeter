import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    closeMobileMenu();
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-icon">🎬</div>
          <span className="logo-text">TJ</span>
          <div className="logo-badge">PRO</div>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          {token ? (
            <>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                My Profile
              </Link>
              <button onClick={logout} className="logout-button">
                <span className="logout-icon">🚪</span>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link login-link">
                Sign In
              </Link>
              <Link to="/register" className="auth-link register-link">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button 
          className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
          Home
        </Link>
        {token ? (
          <>
            <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
              My Profile
            </Link>
            <button onClick={logout} className="mobile-logout-button">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-auth-link" onClick={closeMobileMenu}>
              Sign In
            </Link>
            <Link to="/register" className="mobile-auth-link" onClick={closeMobileMenu}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
