import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './navbar.css';
import { useCart } from '../context/cart';
import SearchOverlay from './SearchOverlay';

function Navbar({ user, setUser, searchQuery, setSearchQuery }) {
    const { clearCart } = useCart();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const [isSearchActive, setIsSearchActive] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlQuery = searchParams.get('q');

        if (location.pathname === '/search-results' && urlQuery) {
            setSearchQuery(urlQuery);
        }
    }, [location.pathname, location.search, setSearchQuery]);

    useEffect(() => {
        if (user && user.username) {
            const savedTheme = localStorage.getItem(`theme_${user.username}`);
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(false);
        }
    }, [user]);

    useEffect(() => {
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
        document.body.classList.remove('dark-theme');
        setIsDarkMode(false);
        setUser(null);
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { type: 'logout' } }));
        navigate('/');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key !== 'Enter') return;

        e.preventDefault();

        const queryStr = searchQuery.trim();

        if (!queryStr) return;

        const savedSearches = localStorage.getItem('recent_searches');
        let currentSearches = savedSearches ? JSON.parse(savedSearches) : [];

        currentSearches = [
            queryStr,
            ...currentSearches.filter((s) => s !== queryStr)
        ].slice(0, 5);

        localStorage.setItem('recent_searches', JSON.stringify(currentSearches));

        try {
            const response = await fetch(
                `/api/restaurants/search?q=${encodeURIComponent(queryStr)}`
            );

            if (!response.ok) {
                console.error('Search failed:', response.status);
                return;
            }

            const data = await response.json();

            const restaurants = data.restaurants || [];

            if (restaurants.length === 1) {
                const restaurant = restaurants[0];
                const restaurantId = restaurant._id || restaurant.id;

                if (restaurantId) {
                    setIsSearchActive(false);
                    navigate(`/restaurant/${restaurantId}`);
                }
            }

            // If there are 0 restaurants or more than 1, do nothing.
        } catch (error) {
            console.error('Search enter error:', error);
        }
    };

    const clearSearchInput = (e) => {
        e.stopPropagation();
        setSearchQuery('');
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    const displayName = user?.displayName || user?.username || 'User';

    return (
        <>
            <nav className="wolt-navbar">
                <div className="navbar-left">
                    <span className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', textDecoration: 'none', color: '#00c2e8' }}>
                        bites
                    </span>
                </div>
                <div className={`navbar-center ${isSearchActive ? 'search-focused' : ''}`}>
                    <div className="search-wrapper" onClick={() => setIsSearchActive(true)}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search restaurants, cuisines or dishes..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            ref={searchInputRef}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={clearSearchInput}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                {user ? (
                    <div className="navbar-right">
                        {user && (
                            <button
                                type="button"
                                className="past-orders-button"
                                onClick={() => navigate('/past-orders')}
                                title="Past Orders"
                            >
                                🛒
                            </button>
                        )}

                        <button className="theme-toggle" onClick={toggleTheme}>
                            <span className="knob"></span>
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

            {isSearchActive && (
                <SearchOverlay
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onClose={() => {
                        setIsSearchActive(false);
                        setSearchQuery('');
                    }}
                />
            )}
        </>
    );
}

export default Navbar;