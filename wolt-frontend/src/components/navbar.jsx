import React, { useEffect } from 'react';
import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const navigate = useNavigate();

    React.useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
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

    const displayName = user?.displayName || user?.username || 'User';

    return (
        <nav className="wolt-navbar">
            <div className="navbar-left">
                <span className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', textDecoration: 'none', color: '#00c2e8' }}>
                    bites
                </span>
            </div>

            <div className="navbar-right">
                {/* THEME TOGGLE */}
                <button className="theme-toggle" onClick={toggleTheme}>
                    <span className={`icon sun ${isDarkMode ? 'hidden' : ''}`}>☀️</span>
                    <span className={`icon moon ${!isDarkMode ? 'hidden' : ''}`}>🌙</span>
                    <span className="knob"></span>
                </button>

                {/* USER MENU */}
                <div className="user-menu">
                    <span className="display-name">{displayName}</span>
                    
                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={displayName}
                            className="profile-avatar"
                        />
                    ) : (
                        <div className="profile-avatar avatar-placeholder">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;