import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

/**
 * HomePage Component
 * Displays the landing page. Shows personalized content for logged-in users,
 * including a conditional link to the Owner Dashboard if the user is an owner.
 */
const HomePage = ({ user }) => {
    return (
        <div className="home-page-container">
            {user ? (
                /* Member Home Page: Shows personalized welcome and navigation */
                <div className="container mt-5 text-center animate__animated animate__fadeIn">
                    <h1 className="display-4 fw-bold text-dark mb-3">
                        Welcome back, {user.displayName || user.username || 'User'}! 👋
                    </h1>
                    <p className="lead text-secondary">This is your main Dashboard / Home Page.</p>
                    
                    <div className="mt-4 d-flex justify-content-center gap-3">
                        {/* Navigation to general restaurants feed */}
                        <Link to="/restaurants" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                            Go to Restaurants Feed
                        </Link>

                        {/* Owner-only button: Rendered conditionally based on user role */}
                        {user.role === 'owner' && (
                            <Link to="/owner/dashboard" className="btn btn-outline-info rounded-pill px-4 py-2 fw-bold shadow-sm">
                                My Restaurants
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                /* Guest Home Page: Shows generic welcome for non-authenticated users */
                <div className="container text-center home-welcome-content animate__animated animate__fadeIn">
                    <h1 className="display-4 fw-bold mb-3">Welcome to bites Home Page!</h1>
                    <p className="lead text-secondary">This page is public and visible to everyone.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;