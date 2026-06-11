import React, { useEffect } from 'react';
import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  // Initialize state by checking localStorage first. Default to false if not found.
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light'); // Persist theme selection
      return newMode;
    });
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.body.classList.remove('dark-theme');
    setIsDarkMode(false);
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="wolt-navbar">

      <div className="navbar-left">
        <Link to="/" className="brand-logo" style={{ textDecoration: 'none', color: '#00c2e8' }}>
          bites
        </Link>
      </div>

      <div className="navbar-right">

        {/* THEME TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className={`icon sun ${isDarkMode ? 'hidden' : ''}`}>☀️</span>
          <span className={`icon moon ${isDarkMode ? '' : 'hidden'}`}>🌙</span>
          <span className="knob"></span>
        </button>

        {/* USER */}
        <div className="user-menu">
          <span className="display-name">
            {user?.displayName}
          </span>

          <img
            src={user?.profileImage || 'default-avatar.png'}
            alt="User"
            className="profile-avatar"
          />

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;