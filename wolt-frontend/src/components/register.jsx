import React, { useState, useRef } from 'react';

const Register = () => {
    // State hooks for tracking form input values
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');

    // State hooks for tracking form submission and validation errors
    const [wasValidated, setWasValidated] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // useRef hook used to reference the file input element as required by specifications
    const fileInputRef = useRef(null);

    // Password validation: Minimum 8 characters, must contain both letters and numbers
    const isPasswordValid = (pwd) => {
        const hasLetters = /[a-zA-Z]/.test(pwd);
        const hasNumbers = /\d/.test(pwd);
        return pwd.length >= 8 && hasLetters && hasNumbers;
    };

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

    // Form submission handler
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
        alert('Validation successful! Ready to transmit data to the API.');
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
            alert('User registered successfully in the Database!');
        } else {
            // if the server rejects the registration 
            const errorData = await response.json().catch(() => ({}));
            setGeneralError(errorData.message || 'Registration failed on the server.');
        }
    } catch (error) {
        // network or other unexpected errors during the fetch operation
        console.error('Network error during registration:', error);
        setGeneralError('Network error. Please check if your server is running.');
    }
};
    ;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4 text-primary fw-bold">Sign Up to Wolt</h2>
                            
                            {/* Generic validation server-like error message alert */}
                            {generalError && (
                                <div className="alert alert-danger text-center fw-semibold" role="alert">
                                    {generalError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                {/* Username input container */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Username</label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${wasValidated ? (username ? 'is-valid' : 'is-invalid') : ''}`}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                    />
                                    <div className="invalid-feedback">Username is required.</div>
                                </div>

                                {/* Display Name input container */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Display Name</label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${wasValidated ? (displayName ? 'is-valid' : 'is-invalid') : ''}`}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your public display name"
                                        required
                                    />
                                    <div className="invalid-feedback">Display name is required.</div>
                                </div>

                                {/* Password input container */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Password</label>
                                    <input 
                                        type="password" 
                                        className={`form-control ${wasValidated ? (isPasswordValid(password) ? 'is-valid' : 'is-invalid') : ''}`}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters, numbers & letters"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Password must be at least 8 characters long and contain both letters and numbers.
                                    </div>
                                    <div className="form-text text-muted small">Must include letters and numbers (min. 8 chars).</div>
                                </div>

                                {/* Confirm Password input container */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className={`form-control ${wasValidated ? (doPasswordsMatch ? 'is-valid' : 'is-invalid') : ''}`}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        required
                                    />
                                    <div className="invalid-feedback">Passwords must match exactly.</div>
                                </div>

                                {/* Profile Image upload container using fileInputRef */}
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Profile Image</label>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className={`form-control ${wasValidated ? (profileImage ? 'is-valid' : 'is-invalid') : ''}`}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required
                                    />
                                    <div className="invalid-feedback">Please upload a profile picture.</div>
                                    
                                    {/* Image runtime dynamic preview rendering */}
                                    {profileImage && (
                                        <div className="text-center mt-3">
                                            <p className="text-muted small mb-1">Image Preview:</p>
                                            <img 
                                                src={profileImage} 
                                                alt="Profile Preview" 
                                                className="rounded-circle border border-2 border-primary shadow-sm"
                                                style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Action button to submit the form */}
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold uppercase shadow-sm">
                                    Register Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;