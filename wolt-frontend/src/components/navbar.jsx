import React, { useEffect, useRef } from 'react';
import './navbar.css';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ user, setUser, searchQuery, setSearchQuery }) {
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const navigate = useNavigate();
    
    //Created the reference for the search input
    const searchInputRef = useRef(null);

    // Auto-focus logic that triggers safely when the component mounts or when the user logs in. At the end of the useEffect, added 'user' as a dependency so it focuses right after login
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [user]); 

    // Check if a user is logged in and fetch their personal theme preference from localStorage
    useEffect(() => {
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
        return () => {
            document.body.classList.remove('dark-theme');
        };
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

            {user ? (
                <>
                    <div className="navbar-center" style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }}>
                        <div className="input-group">
                            <span className="input-group-text text-muted">🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search restaurants or cuisines..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                ref={searchInputRef} 
                            />
                        </div>
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
                </>
            ) : (
                <div className="navbar-right d-flex gap-2">
                    <Link to="/login" className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm" style={{ borderWidth: '2px' }}>
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-info text-white rounded-pill px-4 fw-bold shadow-sm">
                        Sign up
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;