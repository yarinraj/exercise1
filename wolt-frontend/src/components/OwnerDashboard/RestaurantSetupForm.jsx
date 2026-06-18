import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';
import Toast from '../Toast';

/**
 * RestaurantSetupForm Component
 * Form to create a new restaurant. Coordinates (lat, lng) are strictly required.
 */
const RestaurantSetupForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cuisine: '',
        description: '',
        phone: '',
        image: '',
        lat: '',
        lng: '',
        isPromoted: false
    });

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info'
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (
            !formData.name ||
            !formData.address ||
            !formData.cuisine ||
            formData.lat === '' ||
            formData.lng === ''
        ) {
            showToast(
                'Please fill in all required fields: Name, Address, Cuisine, Latitude, Longitude.',
                'error'
            );
            return false;
        }

        if (formData.image) {
            const urlPattern = /^(https?:\/\/)/i;

            if (!urlPattern.test(formData.image)) {
                showToast(
                    'Please enter a valid image URL starting with http:// or https://',
                    'error'
                );
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            showToast('You are not logged in.', 'error');
            return;
        }

        const payload = {
            ...formData,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng)
        };

        try {
            showToast('Creating restaurant...', 'info');

            const response = await fetch('http://localhost:8080/api/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Restaurant created successfully!', 'success');

                setTimeout(() => {
                    navigate('/owner/dashboard');
                }, 1500);

                return;
            }

            const errorData = await response.json().catch(() => null);

            showToast(
                errorData?.error ||
                errorData?.message ||
                'Failed to create restaurant.',
                'error'
            );
        } catch (error) {
            console.error('Create restaurant error:', error);
            showToast('Server error, please try again later.', 'error');
        }
    };

    return (
        <div className="register-page-container min-vh-100 py-5">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <BackgroundDoodles />

            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">Create Your Restaurant</h2>
                            <p className="text-muted">
                                Fields marked with * are required. Add optional details to stand out!
                            </p>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                <FormInput
                                    name="name"
                                    label="Restaurant Name *"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={true}
                                />

                                <FormInput
                                    name="address"
                                    label="Address *"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required={true}
                                />

                                <FormInput
                                    name="cuisine"
                                    label="Cuisine Type *"
                                    type="text"
                                    value={formData.cuisine}
                                    onChange={handleChange}
                                    required={true}
                                />

                                <div className="row">
                                    <div className="col-6">
                                        <FormInput
                                            name="lat"
                                            label="Latitude *"
                                            type="number"
                                            step="any"
                                            value={formData.lat}
                                            onChange={handleChange}
                                            placeholder="e.g., 32.0853"
                                            required={true}
                                        />
                                    </div>

                                    <div className="col-6">
                                        <FormInput
                                            name="lng"
                                            label="Longitude *"
                                            type="number"
                                            step="any"
                                            value={formData.lng}
                                            onChange={handleChange}
                                            placeholder="e.g., 34.7818"
                                            required={true}
                                        />
                                    </div>
                                </div>

                                <FormInput
                                    name="description"
                                    label="Description (Optional)"
                                    type="text"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required={false}
                                />

                                <FormInput
                                    name="phone"
                                    label="Phone Number (Optional)"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required={false}
                                />

                                <FormInput
                                    name="image"
                                    label="Cover Image URL (Optional)"
                                    type="url"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/cover.jpg"
                                    required={false}
                                />

                                <div className="card bg-light border-warning my-4 rounded-3 animate__animated animate__fadeIn">
                                    <div className="card-body p-3">
                                        <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                                            <div className="text-start me-3">
                                                <label
                                                    className="form-check-label fw-bold text-dark d-block"
                                                    htmlFor="isPromoted"
                                                >
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
                                                onChange={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        isPromoted: !prev.isPromoted
                                                    }))
                                                }
                                                style={{
                                                    width: '2.5em',
                                                    height: '1.25em',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3"
                                >
                                    Create Restaurant
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSetupForm;