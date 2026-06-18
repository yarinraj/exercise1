import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/**
 * HomePage Component
 * Displays the landing page. Shows personalized content for logged-in users,
 * including a conditional link to the Owner Dashboard if the user is an owner.
 */
const HomePage = ({ user }) => {
    const [isLogoSpinning, setIsLogoSpinning] = useState(false);

    useEffect(() => {
        if (!user) {
            document.body.classList.remove('dark-theme');
        }
    }, [user]);

    const handleLogoSpin = () => {
        setIsLogoSpinning(true);

        setTimeout(() => {
            setIsLogoSpinning(false);
        }, 900);
    };

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
            <div className="home-hero-layout animate__animated animate__fadeIn">
                <div className="home-title-card">
                    <h1 className="display-4 fw-bold mb-3">
                        Welcome!
                    </h1>

                    <p className="lead mb-0">
                        {user
                            ? 'This is your main Dashboard / Home Page.'
                            : 'Explore restaurants and order your favorite food.'}
                    </p>
                </div>

                <button
                    type="button"
                    className={`bites-center-logo-button ${isLogoSpinning ? 'spin-coin' : ''}`}
                    onClick={handleLogoSpin}
                    aria-label="Spin bites logo"
                >
                    <img
                        src={`${process.env.PUBLIC_URL}/icon.svg`}
                        alt="bites logo"
                        className="bites-center-logo-img"
                    />
                </button>

                <div className="home-actions-card">
                    <Link
                        to="/restaurants"
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                    >
                        Go to Restaurants Feed
                    </Link>

                    {user?.role === 'owner' && (
                        <Link
                            to="/owner/dashboard"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        >
                            My Restaurants
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;