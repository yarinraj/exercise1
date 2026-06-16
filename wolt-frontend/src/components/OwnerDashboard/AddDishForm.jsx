import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * AddDishForm Component
 * Allows the owner to add a new dish. Description and Image are optional.
 */
const AddDishForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State to manage form inputs
    const [formData, setFormData] = useState({
        name: '',
        description: '', // Optional field
        price: '',
        image: ''        // Optional field
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

        // 1. Validate ONLY the strictly required fields (Name and Price)
        if (!formData.name || !formData.price) {
            setStatusMessage({ text: '❌ Please fill in the required fields (Name, Price)!', type: 'alert-danger' });
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

        try {
            setStatusMessage({ text: 'Adding dish...', type: 'alert-info' });
            const token = localStorage.getItem('token');

            // Send POST request to the backend
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatusMessage({ text: '✅ Dish added successfully!', type: 'alert-success' });
                // Redirect back to menu management after short delay
                setTimeout(() => navigate(`/owner/edit/${id}/menu`), 500);
            } else {
                const errorData = await response.json();
                setStatusMessage({ text: `❌ ${errorData.error || 'Failed to add dish'}`, type: 'alert-danger' });
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
                            <h2 className="fw-bold">Add New Dish</h2>
                            <p className="text-muted">Fields marked with * are required.</p>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                {/* Required Fields */}
                                <FormInput name="name" label="Dish Name *" type="text" value={formData.name} onChange={handleChange} required={true} />
                                <FormInput name="price" label="Price (₪) *" type="number" value={formData.price} onChange={handleChange} required={true} />

                                {/* Optional Fields */}
                                <FormInput name="description" label="Description (Optional)" type="text" value={formData.description} onChange={handleChange} required={false} />
                                <FormInput name="image" label="Image URL (Optional)" type="url" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" required={false} />

                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3">
                                    Add Dish
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

export default AddDishForm;