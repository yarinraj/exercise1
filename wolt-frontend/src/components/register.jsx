
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from './common/FormInput';
import BackgroundDoodles from './common/BackgroundDoodles';
import './common/auth.css'; // Shared styling for authentication pages
// Password validation: Minimum 8 characters, must contain both letters and numbers
const isPasswordValid = (pwd) => {
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    return pwd.length >= 8 && hasLetters && hasNumbers;
};
const Register = ({ setUser }) => {
    const navigate = useNavigate();
    
    // State hooks for tracking form input values
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);
    const [isConfirmTouched, setIsConfirmTouched] = useState(false);
    const isValidPassword = isPasswordValid(password);
    const isTypingMistake = confirmPassword !== '' && !password.startsWith(confirmPassword);
    const isPerfectMatch = confirmPassword !== '' && password === confirmPassword;
    const [profileImage, setProfileImage] = useState('');

    // State hooks for tracking form submission and validation errors
    const [wasValidated, setWasValidated] = useState(false);
    const [generalError, setGeneralError] = useState('');
    
    // Reference for the hidden file input element
    const fileInputRef = useRef(null);

    // State to hold the real-time username availability error
    const [usernameError, setUsernameError] = useState('');

    // Function to check username availability on blur
    const checkUsernameAvailability = async () => {
        if (!username.trim()) return; // Don't check if the field is empty

        try {
            // Sending a quick request to the backend to check if username exists
            const response = await fetch(`/api/users/check-username/${username}`);
            const data = await response.json();

            if (data.exists) {
                // If the backend says it exists, trigger the red error text
                setUsernameError('This username is already taken.');
            } else {
                // If it's free, clear the error immediately
                setUsernameError('');
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    }

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
                //  Temporary Mock: Force log-in using form data to test the Navbar layout
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
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(''); // Clear the real-time error as soon as the user starts typing again
                        }}
                        //Trigger the backend validation when the user leaves this input field
                        onBlur={checkUsernameAvailability}
                        placeholder="Choose a username"
                        required
                        // Force validation styling if the form was submitted OR if an inline error exists
                        wasValidated={wasValidated || usernameError !== ''}
                        // Field is valid ONLY if it's not empty AND the username is not taken
                        isValid={username !== '' && !usernameError}
                        // Dynamically switch the error text between "required" and "already taken"
                        errorFeedback={username === '' ? "Username is required." : usernameError}
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

                        // signals that the user has finished interacting with the password field
                        onBlur={() => setIsPasswordTouched(true)}

                        placeholder="Enter your password"
                        required

                        // Logic:
                        // we visually validate the password field if:
                        // - the user tried to submit the form (wasValidated) OR
                        // - they left the field after visiting it (isPasswordTouched) OR
                        // - they typed something that satisfies the password requirements (isValidPassword)
                        // as soon as one of these conditions is met, the field will show green or red
                        wasValidated={wasValidated || isPasswordTouched || isValidPassword}

                        // green <=> the password satisfies all complexity requirements
                        isValid={isValidPassword}

                        errorFeedback="Password must be at least 8 characters long and contain both letters and numbers."
                        hint="Must include at least 8 characters, containing both letters and numbers."
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}

                        // Triggers when the user leaves the field (catches incomplete passwords)
                        onBlur={() => setIsConfirmTouched(true)}
                        placeholder="Repeat your password"
                        required

                        // TRIGGER VISUAL VALIDATION IF:
                        // - General form submitted (wasValidated) OR
                        // - They typed a wrong character (isTypingMistake) OR
                        // - They finished and it matches perfectly (isPerfectMatch) OR
                        // - They left the field after visiting it (isConfirmTouched)
                        wasValidated={wasValidated || isTypingMistake || isPerfectMatch || isConfirmTouched}

                        //  FIELD IS GREEN ONLY IF IT'S A PERFECT MATCH
                        isValid={isPerfectMatch}

                        errorFeedback={isTypingMistake ? "Passwords do not match." : "Please complete your password."}
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