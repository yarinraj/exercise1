import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        navigate('/login');
    };

    const displayName = user?.displayName || user?.username || 'User';

    return (
        <nav className="wolt-navbar">
            <div className="navbar-left">
                <span className="brand-logo" onClick={() => navigate('/')}>
                    bites
                </span>
            </div>

            <div className="navbar-right">
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