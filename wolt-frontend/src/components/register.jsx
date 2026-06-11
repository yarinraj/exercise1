import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from './common/FormInput';
import BackgroundDoodles from './common/BackgroundDoodles';
import './common/auth.css'; // Shared styling for authentication pages

const Register = ({ setUser }) => {
    const navigate = useNavigate();
    
    // State hooks for tracking form input values
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');

    // State hooks for tracking form submission and validation errors
    const [wasValidated, setWasValidated] = useState(false);
    const [generalError, setGeneralError] = useState('');
    
    // Reference for the hidden file input element
    const fileInputRef = useRef(null);

    // Password complexity validation: Min 8 chars, must contain letters and numbers
    const isPasswordValid = (pwd) => {
        const hasLetters = /[a-zA-Z]/.test(pwd);
        const hasNumbers = /\d/.test(pwd);
        return pwd.length >= 8 && hasLetters && hasNumbers;
    };

    const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

    // Handle image upload and convert to Base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Stores the base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setWasValidated(true);
        setGeneralError('');

        // Validate all required fields are filled
        if (!username || !displayName || !password || !confirmPassword || !profileImage) {
            setGeneralError('Registration failed. All fields are required, including a profile image.');
            return;
        }

        // Validate password rules
        if (!isPasswordValid(password)) {
            setGeneralError('Registration failed. Please satisfy the password criteria.');
            return;
        }

        // Validate matching passwords
        if (!doPasswordsMatch) {
            setGeneralError('Registration failed. Passwords do not match.');
            return;
        }

        // Construct payload for the POST request
        const newUserPayload = {
            username,
            password,
            displayName,
            profileImage
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserPayload),
            });

            if (response.ok) {
                // 🌟 Temporary Mock: Force log-in using form data
                // This will be replaced with actual token fetching in the next sub-task
                const loggedInUser = {
                    username: username,
                    displayName: displayName,
                    profileImage: profileImage 
                };

                localStorage.setItem('user', JSON.stringify(loggedInUser));
              

                // Clear form fields
                setUsername('');
                setDisplayName('');
                setPassword('');
                setConfirmPassword('');
                setProfileImage('');
                setWasValidated(false);

                alert('User registered successfully! Redirecting to login page...');
                navigate('/login');
            } else {
                // Server rejected the registration (e.g., username taken)
                const errorData = await response.json().catch(() => ({}));
                setGeneralError(
                    errorData.error ||
                    errorData.message ||
                    'Registration failed on the server.'
                );
            }
        } catch (error) {
            console.error('Network error during registration:', error);
            setGeneralError('Network error. Please check if your server is running.');
        }
    };

    return (
        <div className="container register-page-container">
            {/* Navigation Link to Login Page */}
            <div style={{ position: 'absolute', top: '35px', right: '20px', zIndex: 1000 }}>
                <Link
                    to="/login"
                    className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm"
                    style={{ borderWidth: '2px', fontSize: '0.9rem' }}
                >
                    Login
                </Link>
            </div>

            {/* Render the shared floating emojis background */}
            <BackgroundDoodles />

            <div className="bites-logo-container">
                <div className="delivery-scooter">
                    <span className="scooter-mirror">🛵</span>
                </div>
                <div className="bites-logo-text">bites</div>
            </div>

            <div className="register-card">
                <div className="register-header">
                    <h2 className="register-title">Sign Up to bites</h2>
                    <p className="register-subtitle">Discover foods, groceries, essentials, and maybe bytes delivered directly to your doorstep.</p>
                </div>

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
                        placeholder="Choose a username"
                        required
                        wasValidated={wasValidated}
                        isValid={username !== ''}
                        errorFeedback="Username is required."
                    />

                    <FormInput
                        label="Display Name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your public name"
                        required
                        wasValidated={wasValidated}
                        isValid={displayName !== ''}
                        errorFeedback="Display name is required."
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                        wasValidated={wasValidated}
                        isValid={isPasswordValid(password)}
                        errorFeedback="Password must be at least 8 characters long and contain both letters and numbers."
                        hint="Must include letters and numbers (min. 8 chars)."
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        required
                        wasValidated={wasValidated}
                        isValid={doPasswordsMatch}
                        errorFeedback="Passwords must match exactly."
                    />

                    <div className="wolt-input-group mb-4">
                        <label className="wolt-label">Profile Image</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                id="file-upload"
                                className="file-upload-input"
                                required
                            />
                            <label
                                htmlFor="file-upload"
                                className={`file-upload-button ${wasValidated ? (profileImage ? 'is-valid-upload' : 'is-invalid-upload') : ''}`}
                            >
                                <span>{profileImage ? '✓ Image Selected' : '📸 Choose profile picture'}</span>
                            </label>
                        </div>
                        {wasValidated && !profileImage && (
                            <div className="wolt-invalid-feedback">Please upload a profile picture.</div>
                        )}

                        {/* Dynamic Live Image Preview Rendering */}
                        {profileImage && (
                            <div className="text-center mt-3 animate-preview">
                                <p className="wolt-form-hint mb-2">Image Preview:</p>
                                <img
                                    src={profileImage}
                                    alt="Profile Preview"
                                    className="profile-preview-img"
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="wolt-btn wolt-btn-block">
                        Register Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;