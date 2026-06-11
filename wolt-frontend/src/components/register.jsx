import React, { useState, useRef } from 'react';
import './register.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Reusable form input component for consistent premium Wolt styling and validation feedback
const FormInput = ({ label, type, value, onChange, placeholder, required, wasValidated, isValid, errorFeedback, hint, onBlur }) => {
    // Merging Wolt styling with core validation feedback classes
    const validationClass = wasValidated ? (isValid ? 'is-wolt-valid' : 'is-wolt-invalid') : '';

    return (

        <div className="wolt-input-group">
            <label className="wolt-label">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`wolt-input ${validationClass}`}
                onBlur={onBlur}
            />
            {wasValidated && !isValid && (
                <div className="wolt-invalid-feedback">{errorFeedback}</div>
            )}
            {hint && <div className="wolt-form-hint">{hint}</div>}
        </div>
    );
};
// Password validation: Minimum 8 characters, must contain both letters and numbers
const isPasswordValid = (pwd) => {
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    return pwd.length >= 8 && hasLetters && hasNumbers;
};

const Register = ({ setUser }) => {
    // State hooks for tracking form input values (Kept exactly from your original engine)
    const navigate = useNavigate();
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

    // useRef hook used to reference the file input element as required by your specs
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

    // Confirm password validation: Must match the original password and not be empty
    const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

    // File handling: Converts the uploaded binary image into a Base64 string via FileReader
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Stores the base64 string representation
            };
            reader.readAsDataURL(file);
        }
    };

    // Form submission handler (100% intact)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setWasValidated(true);
        setGeneralError('');

        // Rule: All fields are strictly required
        if (!username || !displayName || !password || !confirmPassword || !profileImage) {
            setGeneralError('Registration failed. All fields are required, including a profile image.');
            return;
        }

        // Rule: Enforce password complexity requirements
        if (!isPasswordValid(password)) {
            setGeneralError('Registration failed. Please satisfy the password criteria.');
            return;
        }

        // Rule: Enforce matching passwords
        if (!doPasswordsMatch) {
            setGeneralError('Registration failed. Passwords do not match.');
            return;
        }

        // Construct payload for the impending POST /api/users request
        const newUserPayload = {
            username,
            password,
            displayName,
            profileImage
        };

        console.log('Form successfully validated. Ready to register user:', newUserPayload);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserPayload),
            });

            // Handle the response from the server
            if (response.ok) {
                //  Temporary Mock: Force log-in using form data to test the Navbar layout
                const loggedInUser = {
                    username: username,
                    displayName: displayName,
                    profileImage: profileImage // The base64 string you generated
                };

                localStorage.setItem('user', JSON.stringify(loggedInUser));
                setUser(loggedInUser); // Update the user state in App to trigger Navbar rendering
                navigate('/'); // Redirect to home page after successful registration

                // Clear form fields
                setUsername('');
                setDisplayName('');
                setPassword('');
                setConfirmPassword('');
                setProfileImage('');
                setWasValidated(false);

                alert('User registered successfully in the Database!');
            } else {
                // If the server rejects the registration 
                const errorData = await response.json().catch(() => ({}));
                setGeneralError(
                    errorData.error ||
                    errorData.message ||
                    'Registration failed on the server.'
                );
            }
        } catch (error) {
            // Network or other unexpected errors during the fetch operation
            console.error('Network error during registration:', error);
            setGeneralError('Network error. Please check if your server is running.');
        }
    };
    const backgroundDoodles = [
        // top left corner
        { emoji: '🍕', top: '14%', left: '5%', size: '1.4rem', duration: '6s', delay: '-1.5s' },
        { emoji: '🍔', top: '22%', left: '14%', size: '1.6rem', duration: '8s', delay: '-4s' },
        { emoji: '🍣', top: '35%', left: '6%', size: '1.3rem', duration: '7s', delay: '-2.5s' },
        { emoji: '🍩', top: '15%', left: '22%', size: '1.5rem', duration: '9s', delay: '-5s' },

        // top right corner
        { emoji: '🍩', top: '12%', left: '78%', size: '1.5rem', duration: '8.5s', delay: '-3.5s' },
        { emoji: '🍕', top: '28%', left: '88%', size: '1.4rem', duration: '6.5s', delay: '-1s' },
        { emoji: '🍔', top: '38%', left: '75%', size: '1.7rem', duration: '7.5s', delay: '-6s' },
        { emoji: '🍣', top: '18%', left: '92%', size: '1.3rem', duration: '9.5s', delay: '-2s' },

        // middle / central area)
        { emoji: '🍟', top: '48%', left: '15%', size: '1.5rem', duration: '7.4s', delay: '-2.8s' },
        { emoji: '🍔', top: '45%', left: '8%', size: '1.5rem', duration: '6.5s', delay: '-0.5s' },

        // middle / central area)
        { emoji: '🍟', top: '46%', left: '79%', size: '1.5rem', duration: '6.7s', delay: '-1.9s' },
        { emoji: '🍕', top: '52%', left: '93%', size: '1.3rem', duration: '7s', delay: '-3.8s' },

        // bottom left corner 
        { emoji: '🍣', top: '60%', left: '8%', size: '1.6rem', duration: '7.2s', delay: '-0.5s' },
        { emoji: '🍩', top: '75%', left: '18%', size: '1.4rem', duration: '8.2s', delay: '-4.5s' },
        { emoji: '🌮', top: '79%', left: '26%', size: '1.4rem', duration: '8.3s', delay: '-4.1s' },
        { emoji: '🍕', top: '88%', left: '5%', size: '1.5rem', duration: '6.8s', delay: '-3s' },

        // bottom right corner
        { emoji: '🍔', top: '62%', left: '85%', size: '1.5rem', duration: '7.8s', delay: '-2.2s' },
        { emoji: '🍣', top: '72%', left: '76%', size: '1.4rem', duration: '6.2s', delay: '-4.8s' },
        { emoji: '🌮', top: '81%', left: '85%', size: '1.6rem', duration: '7.9s', delay: '-5.2s' },
        { emoji: '🍩', top: '85%', left: '90%', size: '1.6rem', duration: '8.7s', delay: '-1.2s' },
    ];
    return (
        <div className="container register-page-container">
            <div style={{ position: 'absolute', top: '35px', right: '20px', zIndex: 1000 }}>
                <Link
                    to="/login"
                    className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm"
                    style={{ borderWidth: '2px', fontSize: '0.9rem' }}
                >
                    Login
                </Link>
            </div>
            {backgroundDoodles.map((doodle, index) => (
                <div
                    key={index}
                    className="bg-doodle-container"
                    style={{
                        position: 'absolute',
                        top: doodle.top,
                        left: doodle.left,
                        zIndex: 1,
                        cursor: 'default',
                    }}
                >
                    <span
                        className="bg-doodle-icon"
                        style={{
                            fontSize: doodle.size,
                            animationDuration: doodle.duration,
                            animationDelay: doodle.delay,
                            display: 'inline-block',
                            cursor: 'default',
                        }}
                    >
                        {doodle.emoji}
                    </span>
                </div>
            ))}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="bites-logo-container">
                    <div className="delivery-scooter">
                        <span className="scooter-mirror">🛵</span>
                    </div>
                    <div className="bites-logo-text">bites</div>
                </div>
            </Link>

            <div className="register-card">
                {/* Premium Wolt Header */}
                <div className="register-header">
                    <h2 className="register-title">Sign Up to bites</h2>
                    <p className="register-subtitle">Discover foods, groceries, essentials, and maybe bytes delivered directly to your doorstep.</p>
                </div>

                {/* Generic Validation Error Display */}
                {generalError && (
                    <div className="wolt-alert-danger" role="alert">
                        ⚠️ {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    {/* Username Input */}
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

                    {/* Display Name Input */}
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

                    {/* Password Input */}
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

                    {/* Confirm Password Input */}
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

                    {/* Custom Profile Image upload using fileInputRef */}
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

                    {/* Wolt Cyan Call-To-Action Button */}
                    <button type="submit" className="wolt-btn wolt-btn-block">
                        Register Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;