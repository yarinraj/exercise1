import React, { useEffect } from 'react';
import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
    // Start with light mode (false) by default until useEffect checks the user's preference
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    const navigate = useNavigate();

    // Check if a user is logged in and fetch their personal theme preference from localStorage
    React.useEffect(() => {
        if (user && user.username) {
            const savedTheme = localStorage.getItem(`theme_${user.username}`);
            setIsDarkMode(savedTheme === 'dark');
        } else {
            // Reset to light mode if no user is logged in
            setIsDarkMode(false);
        }
    }, [user]); 

    // Apply or remove the dark theme class on the document body based on the current state
    React.useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [isDarkMode]);

    // Toggle the theme and save the preference specifically for the logged-in user
    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            if (user && user.username) {
                localStorage.setItem(`theme_${user.username}`, newMode ? 'dark' : 'light');
            }
            return newMode;
        });
    };

    // Handle user logout: clear storage, reset theme, clear user state, and redirect to home
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.body.classList.remove('dark-theme');
        setIsDarkMode(false);
        setUser(null);
        navigate('/');
    };

    // Determine the name to display in the navbar
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