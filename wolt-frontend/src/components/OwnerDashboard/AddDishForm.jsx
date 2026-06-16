import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * AddDishForm Component
 * Adds a new dish to the restaurant menu with consistent design.
 */
const AddDishForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });

    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price) {
            setStatusMessage({ text: '❌ Please fill in all required fields!', type: 'alert-danger' });
            return;
        }

        try {
            setStatusMessage({ text: 'Adding dish...', type: 'alert-info' });
            const token = localStorage.getItem('token');
            
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
        // Using the same container class for the consistent blue gradient background
        <div className="register-page-container min-vh-100 py-5">
            <BackgroundDoodles />
            <div className="container position-relative">
                {/* Using register-card for the shadow and rounded aesthetic */}
                <div className="register-card p-4 mx-auto" style={{ maxWidth: '500px' }}>
                    <h2 className="mb-4 text-center fw-bold">Add New Dish</h2>
                    <form onSubmit={handleSubmit}>
                        <FormInput name="name" label="Dish Name" type="text" value={formData.name} onChange={handleChange} />
                        <FormInput name="description" label="Description" type="text" value={formData.description} onChange={handleChange} />
                        <FormInput name="price" label="Price (₪)" type="number" value={formData.price} onChange={handleChange} />
                        
                        {/* Using the consistent Wolt-style button */}
                        <button type="submit" className="wolt-btn-block rounded-pill fw-bold">
                            Add Dish
                        </button>
                    </form>

                    {statusMessage.text && (
                        <div className={`alert mt-3 text-center ${statusMessage.type}`}>
                            {statusMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddDishForm;