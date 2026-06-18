import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/**
 * HomePage Component
 * Displays the landing page. Shows personalized content for logged-in users,
 * including a conditional link to the Owner Dashboard if the user is an owner.
 */
const HomePage = ({ user }) => {
    useEffect(() => {
        if (!user) {
            document.body.classList.remove('dark-theme');
        }
    }, [user]);

    const backgroundStyle = {
        backgroundImage: `
            linear-gradient(
                rgba(255, 255, 255, 0.18),
                rgba(255, 255, 255, 0.26)
            ),
            url(${process.env.PUBLIC_URL}/homepage4.png)
        `
    };

    return (
        <div className="home-page-container" style={backgroundStyle}>
            {user ? (
                <div className="home-hero-layout animate__animated animate__fadeIn">
                    <div className="home-title-card">
                        <h1 className="display-4 fw-bold mb-3">
                            Welcome {user.displayName || user.username || 'User'}!
                        </h1>

                        <p className="lead mb-0">
                            This is your main Dashboard / Home Page.
                        </p>
                    </div>

                    <div className="home-logo-space" />

                    <div className="home-actions-card">
                        <Link
                            to="/restaurants"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        >
                            Go to Restaurants Feed
                        </Link>

                        {user.role === 'owner' && (
                            <Link
                                to="/owner/dashboard"
                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                            >
                                My Restaurants
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="home-hero-layout animate__animated animate__fadeIn">
                    <div className="home-title-card">
                        <h1 className="display-4 fw-bold mb-3">
                            <h1 className="display-4 fw-bold mb-3">
                                Welcome!
                            </h1>
                        </h1>

                        <p className="lead mb-0">
                            This page is public and visible to everyone.
                        </p>
                    </div>

                    <div className="home-logo-space" />

                    <div className="home-actions-card">
                        <Link
                            to="/restaurants"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        >
                            Go to Restaurants Feed
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;