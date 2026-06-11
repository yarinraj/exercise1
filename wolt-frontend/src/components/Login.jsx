import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormInput from './common/FormInput';
import BackgroundDoodles from './common/BackgroundDoodles';
import './common/auth.css';

const Login = ({ setUser }) => {
    const navigate = useNavigate();

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Validation and error state
    const [wasValidated, setWasValidated] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // Decode JWT payload safely
    const decodeJwtPayload = (token) => {
        const payload = token.split('.')[1];

        if (!payload) {
            throw new Error('Invalid token structure');
        }

        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
        );

        return JSON.parse(atob(paddedBase64));
    };

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setWasValidated(true);
        setGeneralError('');

        // Basic client-side validation
        if (!username || !password) {
            setGeneralError('Please enter both username and password.');
            return;
        }

        try {
            // First request: get JWT token
            const tokenResponse = await fetch('/api/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => null);
                setGeneralError(errorData?.error || 'Invalid username or password.');
                return;
            }

            const tokenData = await tokenResponse.json();
            const token = tokenData.token;

            if (!token) {
                setGeneralError('Login response does not include a token.');
                return;
            }

            // Store the JWT token for future authenticated requests
            localStorage.setItem('token', token);

            // Decode the token to get the user ID
            const payload = decodeJwtPayload(token);
            const userId = payload.userId;

            if (!userId) {
                setGeneralError('Token does not include user ID.');
                return;
            }

            // Second request: fetch full user details, including profile image
            const userResponse = await fetch(`/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                setGeneralError('Could not load user details.');
                return;
            }

            const userData = await userResponse.json();

            const loggedInUser = {
                username: userData.username,
                displayName: userData.displayName,
                profileImage: userData.profileImage,
            };

            // Store the full user locally and update the app state
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);

            // Redirect to the home page
            navigate('/');
        } catch (error) {
            setGeneralError('Login failed. Please try again.');
        }
    };

    return (
        <div className="container register-page-container">
            {/* Navigation link to the registration page */}
            <div
                style={{
                    position: 'absolute',
                    top: '35px',
                    right: '20px',
                    zIndex: 1000,
                }}
            >
                <Link
                    to="/register"
                    className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm"
                >
                    Sign Up
                </Link>
            </div>

            {/* Background decorative elements */}
            <BackgroundDoodles />

            <div className="bites-logo-container">
                <div className="delivery-scooter">
                    <span className="scooter-mirror">🛵</span>
                </div>
                <div className="bites-logo-text">bites</div>
            </div>

            <div className="register-card">
                <div className="register-header">
                    <h2 className="register-title">Welcome Back!</h2>
                    <p className="register-subtitle">
                        Log in to continue your delicious journey.
                    </p>
                </div>

                {/* Error message */}
                {generalError && (
                    <div className="wolt-alert-danger" role="alert">
                        ⚠️ {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <FormInput
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        wasValidated={wasValidated}
                        isValid={username !== ''}
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        wasValidated={wasValidated}
                        isValid={password !== ''}
                    />

                    <button type="submit" className="wolt-btn wolt-btn-block">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;