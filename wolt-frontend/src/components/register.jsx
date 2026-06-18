import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from './common/FormInput';
import BackgroundDoodles from './common/BackgroundDoodles';
import Toast from './Toast';
import './common/auth.css';

// Password validation: Minimum 8 characters, must contain both letters and numbers
const isPasswordValid = (pwd) => {
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    return pwd.length >= 8 && hasLetters && hasNumbers;
};

const Register = ({ setUser }) => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [profileImage, setProfileImage] = useState('');

    const [isPasswordTouched, setIsPasswordTouched] = useState(false);
    const [isConfirmTouched, setIsConfirmTouched] = useState(false);
    const [wasValidated, setWasValidated] = useState(false);
    const [usernameError, setUsernameError] = useState('');

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info'
    });

    const fileInputRef = useRef(null);

    const isValidPassword = isPasswordValid(password);
    const isTypingMistake = confirmPassword !== '' && !password.startsWith(confirmPassword);
    const isPerfectMatch = confirmPassword !== '' && password === confirmPassword;
    const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

    const showToast = (message, type = 'info') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const closeToast = () => {
        setToast((prev) => ({
            ...prev,
            show: false
        }));
    };

    const checkUsernameAvailability = async () => {
        if (!username.trim()) return;

        try {
            const response = await fetch(`/api/users/check-username/${username}`);
            const data = await response.json();

            if (data.exists) {
                setUsernameError('This username is already taken.');
                showToast('This username is already taken.', 'warning');
            } else {
                setUsernameError('');
            }
        } catch (error) {
            console.error('Error checking username:', error);
            showToast('Could not check username availability.', 'error');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileImage(reader.result);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setWasValidated(true);

        if (!username || !displayName || !password || !confirmPassword || !profileImage) {
            showToast(
                'Registration failed. All fields are required, including a profile image.',
                'error'
            );
            return;
        }

        if (usernameError) {
            showToast(usernameError, 'error');
            return;
        }

        if (!isPasswordValid(password)) {
            showToast(
                'Registration failed. Password must be at least 8 characters and contain both letters and numbers.',
                'error'
            );
            return;
        }

        if (!doPasswordsMatch) {
            showToast('Registration failed. Passwords do not match.', 'error');
            return;
        }

        const newUserPayload = {
            username,
            password,
            displayName,
            profileImage,
            role
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUserPayload)
            });

            if (response.ok) {
                showToast('User registered successfully! Redirecting to login page...', 'success');

                setTimeout(() => {
                    navigate('/login');
                }, 2000);

                return;
            }
            const errorData = await response.json().catch(() => ({}));

            showToast(
                errorData.error ||
                errorData.message ||
                'Registration failed on the server.',
                'error'
            );
        } catch (error) {
            console.error('Network error during registration:', error);
            showToast('Network error. Please check if your server is running.', 'error');
        }
    };

    return (
        <div className="container register-page-container">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <div style={{ position: 'absolute', top: '35px', right: '20px', zIndex: 1000 }}>
                <Link
                    to="/login"
                    className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm"
                    style={{ borderWidth: '2px', fontSize: '0.9rem' }}
                >
                    Login
                </Link>
            </div>

            <BackgroundDoodles />

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="bites-logo-container">
                    <div className="delivery-scooter">
                        <span className="scooter-mirror">🛵</span>
                    </div>
                    <div className="bites-logo-text">bites</div>
                </div>
            </Link>

            <div className="register-card">
                <div className="register-header">
                    <h2 className="register-title">Sign Up to bites</h2>
                    <p className="register-subtitle">
                        Discover foods, groceries, essentials, and maybe bytes delivered directly to your doorstep.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <FormInput
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError('');
                        }}
                        onBlur={checkUsernameAvailability}
                        placeholder="Choose a username"
                        required
                        wasValidated={wasValidated || usernameError !== ''}
                        isValid={username !== '' && !usernameError}
                        errorFeedback={username === '' ? 'Username is required.' : usernameError}
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
                        onBlur={() => setIsPasswordTouched(true)}
                        placeholder="Enter your password"
                        required
                        wasValidated={wasValidated || isPasswordTouched || isValidPassword}
                        isValid={isValidPassword}
                        errorFeedback="Password must be at least 8 characters long and contain both letters and numbers."
                        hint="Must include at least 8 characters, containing both letters and numbers."
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setIsConfirmTouched(true)}
                        placeholder="Repeat your password"
                        required
                        wasValidated={wasValidated || isTypingMistake || isPerfectMatch || isConfirmTouched}
                        isValid={isPerfectMatch}
                        errorFeedback={isTypingMistake ? 'Passwords do not match.' : 'Please complete your password.'}
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
                            <div className="wolt-invalid-feedback">
                                Please upload a profile picture.
                            </div>
                        )}

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

                    <div className="role-toggle-wrapper">
                        <label className="wolt-label">Sign up as:</label>

                        <div className="custom-role-toggle">
                            <div
                                className={`role-option ${role === 'customer' ? 'active' : ''}`}
                                onClick={() => setRole('customer')}
                            >
                                <span className="toggle-icon">🤤</span>
                                <span className="toggle-text">Hungry Customer</span>
                            </div>

                            <div
                                className={`role-option ${role === 'owner' ? 'active' : ''}`}
                                onClick={() => setRole('owner')}
                            >
                                <span className="toggle-icon">🤵🏽‍♂️</span>
                                <span className="toggle-text">Business Owner</span>
                            </div>

                            <div className={`toggle-slider ${role}`} />
                        </div>
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