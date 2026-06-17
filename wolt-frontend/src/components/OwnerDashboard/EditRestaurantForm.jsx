import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * EditRestaurantForm Component
 * Allows restaurant owners to fully update their restaurant details.
 * Coordinates are strictly required, while description, phone, and image are optional.
 */
const EditRestaurantForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State to manage form inputs
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        description: '', // Optional
        phone: '',       // Optional
        address: '',
        image: '',       // Optional
        lat: '',         // Required
        lng: '',
        isPromoted: false
    });

    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    // Fetch existing restaurant data when component mounts
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${id}`);
                if (!response.ok) throw new Error('Failed to fetch restaurant details');

                const data = await response.json();

                // Set form state with fetched data
                setFormData({
                    name: data.name || '',
                    cuisine: data.cuisine || '',
                    description: data.description || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    image: data.image || '',
                    lat: data.lat || '',
                    lng: data.lng || '',
                    isPromoted: data.isPromoted || false
                });
            } catch (error) {
                setStatusMessage({ text: '❌ Error loading restaurant data.', type: 'alert-danger' });
            }
        };
        fetchRestaurant();
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission with validation
    const handleUpdate = async (e) => {
        e.preventDefault();

        // 1. Validate strictly required fields (including coordinates)
        if (!formData.name || !formData.address || !formData.cuisine || formData.lat === '' || formData.lng === '') {
            setStatusMessage({ text: '❌ Please fill in all required fields (Name, Address, Cuisine, Latitude, Longitude)!', type: 'alert-danger' });
            return;
        }

        // 2. Validate Image URL ONLY if the user provided one
        // 2. Validate Image URL ONLY if the user provided one
        if (formData.image) {

            const urlPattern = /^(https?:\/\/)/i;
            if (!urlPattern.test(formData.image)) {
                setStatusMessage({ text: '❌ Please enter a valid URL starting with http:// or https://', type: 'alert-danger' });
                return;
            }
        }

        try {
            setStatusMessage({ text: 'Updating...', type: 'alert-info' });
            const token = localStorage.getItem('token');

            if (!token) {
                setStatusMessage({ text: '❌ You are not logged in.', type: 'alert-danger' });
                return;
            }

            // 3. Prepare payload, parsing coordinates to numbers for Mongoose compatibility
            const dataToUpdate = {
                name: formData.name,
                cuisine: formData.cuisine,
                description: formData.description,
                phone: formData.phone,
                address: formData.address,
                image: formData.image,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                isPromoted: formData.isPromoted
            };

            // Send PATCH request to update the restaurant
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });

            // Handle successful update (204 No Content or 200 OK)
            if (response.ok || response.status === 204) {
                setStatusMessage({ text: '✅ Updated successfully!', type: 'alert-success' });
                setTimeout(() => navigate('/owner/dashboard'), 500);
                return;
            }

            // Handle server errors
            const errorData = await response.json().catch(() => null);
            setStatusMessage({
                text: `❌ ${errorData?.error || errorData?.message || 'Update failed'}`,
                type: 'alert-danger'
            });

        } catch (error) {
            console.error('Update error:', error);
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
                            <h2 className="fw-bold">Edit Restaurant</h2>
                            <p className="text-muted">Fields marked with * are required. Add optional details to stand out!</p>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleUpdate} noValidate>
                                {/* Required Fields */}
                                <FormInput name="name" label="Restaurant Name *" type="text" value={formData.name} onChange={handleChange} required={true} />
                                <FormInput name="address" label="Address *" type="text" value={formData.address} onChange={handleChange} required={true} />
                                <FormInput name="cuisine" label="Cuisine Type *" type="text" value={formData.cuisine} onChange={handleChange} required={true} />

                                {/* Location Coordinates (Required) */}
                                <div className="row">
                                    <div className="col-6">
                                        <FormInput name="lat" label="Latitude *" type="number" step="any" value={formData.lat} onChange={handleChange} placeholder="e.g., 32.0853" required={true} />
                                    </div>
                                    <div className="col-6">
                                        <FormInput name="lng" label="Longitude *" type="number" step="any" value={formData.lng} onChange={handleChange} placeholder="e.g., 34.7818" required={true} />
                                    </div>
                                </div>

                                {/* Optional Fields */}
                                <div className="wolt-input-group mb-3">
                                    <label className="wolt-label">Description (Optional)</label>
                                    <textarea
                                        className="wolt-input"
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <FormInput name="phone" label="Phone Number (Optional)" type="tel" value={formData.phone} onChange={handleChange} required={false} />
                                <FormInput name="image" label="Cover Image URL (Optional)" type="url" value={formData.image} onChange={handleChange} placeholder="https://example.com/cover.jpg" required={false} />
                                {/* Premium Promotion Toggle - Dashboard Style */}
                                <div className="mb-4">
                                    <label className="wolt-label fw-bold text-white mb-2 text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                                        Restaurant Promotion
                                    </label>

                                    {formData.isPromoted ? (
                                        <button
                                            type="button"
                                            className="btn w-100 fw-bold py-2 rounded-3 d-flex align-items-center justify-content-center gap-2"
                                            style={{
                                                backgroundColor: '#ffc107',
                                                color: '#12161f',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)'
                                            }}
                                            onClick={() => setFormData(prev => ({ ...prev, isPromoted: false }))}
                                        >
                                            ✅ Active Promotion (Click to Cancel)
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn w-100 fw-bold py-2 rounded-3 d-flex align-items-center justify-content-center gap-2"
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#ffc107',
                                                border: '1px solid #ffc107',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => setFormData(prev => ({ ...prev, isPromoted: true }))}
                                        >
                                            ⭐ Promote This Restaurant
                                        </button>
                                    )}
                                    <div className="text-muted text-center mt-2 small" style={{ fontSize: '0.8rem' }}>
                                        {formData.isPromoted
                                            ? "This restaurant appears at the top of users' feeds."
                                            : "Boost this restaurant to the top of search results."}
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold mt-3 py-2">
                                    Save Changes
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

export default EditRestaurantForm;