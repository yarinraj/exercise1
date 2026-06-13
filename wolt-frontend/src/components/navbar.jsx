import React, { useEffect } from 'react';
import './navbar.css';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ user, setUser, searchQuery, setSearchQuery }) {
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