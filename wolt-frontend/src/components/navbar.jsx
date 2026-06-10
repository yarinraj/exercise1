import React from 'react';
import './navbar.css';

function Navbar({ user, setUser }) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.body.classList.toggle('dark-theme', newMode);
      return newMode;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.body.classList.remove('dark-theme');
    setIsDarkMode(false);
    setUser(null);
  };

  return (
    <nav className="wolt-navbar">

      <div className="navbar-left">
        <span className="brand-logo">
          bites
        </span>
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