import React from 'react';
import './HomePage.css'; 

const HomePage = ({ user }) => {
    return (
        <div className="home-page-container">
            {user ? (
                /* === home page for connected members === */
                <div className="container mt-5 text-center animate__animated animate__fadeIn">
                    <h1 className="display-4 fw-bold text-dark mb-3">Welcome back, {user.name || 'User'}! 👋</h1>
                    <p className="lead text-secondary">This is your main Dashboard / Home Page.</p>
                    <div className="mt-4">
                        <a href="/restaurants" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                            Go to Restaurants Feed
                        </a>
                    </div>
                </div>
            ) : (
                /* === home page for guests === */
                <div className="container text-center home-welcome-content animate__animated animate__fadeIn">
                    <h1 className="display-4 fw-bold mb-3">Welcome to bites Home Page!</h1>
                    <p className="lead text-secondary">This page is public and visible to everyone.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;