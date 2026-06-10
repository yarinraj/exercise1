import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset global auth state
    setUser(null);
    
    // Redirect to login screen
    navigate('/login');
  };

  return (
    <nav className="wolt-navbar">
      <div className="navbar-left">
        <span className="brand-logo" onClick={() => navigate('/')}>bites</span>
      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <span className="display-name">{user?.displayName}</span>
          <img 
            src={user?.profileImage || 'default-avatar.png'} 
            alt={user?.displayName || 'User'} 
            className="profile-avatar" 
          />
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;