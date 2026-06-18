import React, { useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './navbar.css';
import { useCart } from '../context/cart';

function Navbar({ user, setUser, searchQuery, setSearchQuery }) {
    const { clearCart } = useCart();
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const navigate = useNavigate();
    const location = useLocation();
    
    // Created the reference for the search input
    const searchInputRef = useRef(null);

    // Auto-focus logic for the search bar
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [user]); 

    // Sync theme with user preference
    useEffect(() => {
        if (user && user.username) {
            const savedTheme = localStorage.getItem(`theme_${user.username}`);
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(false);
        }
    }, [user]); 

    // Apply dark theme class to body
    React.useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        return () => document.body.classList.remove('dark-theme');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            if (user && user.username) {
                localStorage.setItem(`theme_${user.username}`, newMode ? 'dark' : 'light');
            }
            return newMode;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cart');
        clearCart();
        document.body.classList.remove('dark-theme');
        window.location.href = '/'; 
    };

    // --- Smart Search Handler ---
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // If typing and NOT on the home/feed page, redirect there immediately
        if (value.trim() !== '' && location.pathname !== '/' && location.pathname !== '/restaurants') {
            navigate('/');
        }
    };

    // Determine the name to display in the navbar
    const displayName = user?.displayName || user?.username || 'User';

    return (
        <nav className="wolt-navbar">
            {/* Logo Section */}
            <div className="navbar-left">
                <span className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', textDecoration: 'none', color: '#00c2e8' }}>
                    bites
                </span>
            </div>

            {/* SINGLE SEARCH BAR - Always visible and uses the smart handleSearch */}
            <div className="navbar-center" style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Search restaurants or cuisines..."
                        value={searchQuery}
                        style={{ borderRadius: '20px' }}
                        onChange={handleSearch}
                        ref={searchInputRef} 
                    />
                </div>
            </div>

            {/* Conditional User Menu - Shows Login/Signup for guests, profile/logout for users */}
            {user ? (
                <div className="navbar-right">
                    {/* Theme Toggle Button */}
                    <button className="theme-toggle" onClick={toggleTheme}>
                        <span className={`icon sun ${isDarkMode ? 'hidden' : ''}`}>☀️</span>
                        <span className={`icon moon ${!isDarkMode ? 'hidden' : ''}`}>🌙</span>
                    </button>

                    <div className="user-menu">
                        <span className="display-name">{displayName}</span>
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={displayName} className="profile-avatar" />
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