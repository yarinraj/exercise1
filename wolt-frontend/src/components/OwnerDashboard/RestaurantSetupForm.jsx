import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * RestaurantSetupForm Component
 * Form to create a new restaurant. Coordinates (lat, lng) are now strictly required.
 */
const RestaurantSetupForm = () => {
    const navigate = useNavigate();

    // State to manage form inputs
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cuisine: '',
        description: '', // Optional
        phone: '',       // Optional
        image: '',       // Optional
        lat: '',         // Required coordinate
        lng: '',          // Required coordinate
        isPromoted: false, // Optional, default to false
    });

    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    // Handle input changes dynamically
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission with validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate strictly required fields, now including lat and lng
        if (!formData.name || !formData.address || !formData.cuisine || formData.lat === '' || formData.lng === '') {
            setStatusMessage({ text: '❌ Please fill in all required fields (Name, Address, Cuisine, Latitude, Longitude)!', type: 'alert-danger' });
            return;
        }

        // 2. Validate Image URL ONLY if the user provided one
        if (formData.image) {
            const urlPattern = /^(https?:\/\/)/i;
            if (!urlPattern.test(formData.image)) {
                setStatusMessage({ text: '❌ Please enter a valid URL starting with http:// or https://', type: 'alert-danger' });
                return;
            }
        }

        // 3. Prepare payload, parsing coordinates to numbers for Mongoose
        const payload = { ...formData };
        payload.lat = parseFloat(payload.lat);
        payload.lng = parseFloat(payload.lng);

        try {
            setStatusMessage({ text: 'Creating restaurant...', type: 'alert-info' });
            const token = localStorage.getItem('token');

            // Send POST request to the backend
            const response = await fetch(`http://localhost:8080/api/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStatusMessage({ text: '✅ Restaurant created successfully!', type: 'alert-success' });
                // Redirect to owner dashboard
                setTimeout(() => navigate('/owner/dashboard'), 500);
            } else {
                const errorData = await response.json();
                setStatusMessage({ text: `❌ ${errorData.error || 'Failed to create restaurant'}`, type: 'alert-danger' });
            }
        } catch (error) {
            setStatusMessage({ text: '❌ Server error, please try again later.', type: 'alert-danger' });
        }
    };

    return (
        <div className="register-page-container min-vh-100 py-5">
            <BackgroundDoodles />
            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">

                        <div className="text-center mb-4">
                            <h2 className="fw-bold">Create Your Restaurant</h2>
                            <p className="text-muted">Fields marked with * are required. Add optional details to stand out!</p>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                {/* Required Fields */}
                                <FormInput name="name" label="Restaurant Name *" type="text" value={formData.name} onChange={handleChange} required={true} />
                                <FormInput name="address" label="Address *" type="text" value={formData.address} onChange={handleChange} required={true} />
                                <FormInput name="cuisine" label="Cuisine Type *" type="text" value={formData.cuisine} onChange={handleChange} required={true} />

                                {/* Location Coordinates (Now Required) */}
                                <div className="row">
                                    <div className="col-6">
                                        <FormInput name="lat" label="Latitude *" type="number" step="any" value={formData.lat} onChange={handleChange} placeholder="e.g., 32.0853" required={true} />
                                    </div>
                                    <div className="col-6">
                                        <FormInput name="lng" label="Longitude *" type="number" step="any" value={formData.lng} onChange={handleChange} placeholder="e.g., 34.7818" required={true} />
                                    </div>
                                </div>

                                {/* Optional Fields */}
                                <FormInput name="description" label="Description (Optional)" type="text" value={formData.description} onChange={handleChange} required={false} />
                                <FormInput name="phone" label="Phone Number (Optional)" type="text" value={formData.phone} onChange={handleChange} required={false} />
                                <FormInput name="image" label="Cover Image URL (Optional)" type="url" value={formData.image} onChange={handleChange} placeholder="https://example.com/cover.jpg" required={false} />
                                {/* Premium Promotion Feature Section */}
                                <div className="card bg-light border-warning my-4 rounded-3 animate__animated animate__fadeIn">
                                    <div className="card-body p-3">
                                        <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                                            <div className="text-start me-3">
                                                <label className="form-check-label fw-bold text-dark d-block" htmlFor="isPromoted">
                                                    ⭐ Promote Your Restaurant
                                                </label>
                                                <small className="text-muted d-block mt-1 lh-sm">
                                                    Notice: promoting your restaurant costs 199.90₪ a month.
                                                </small>
                                            </div>
                                            <input
                                                className="form-check-input ms-0"
                                                type="checkbox"
                                                id="isPromoted"
                                                name="isPromoted"
                                                checked={formData.isPromoted}
                                                onChange={() => setFormData(prev => ({ ...prev, isPromoted: !prev.isPromoted }))}
                                                style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3">
                                    Create Restaurant
                                </button>
                            </form>

                            {/* Status feedback message */}
                            {statusMessage.text && (
                                <div className={`alert mt-4 text-center rounded-3 ${statusMessage.type}`} role="alert">
                                    {statusMessage.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSetupForm;