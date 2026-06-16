import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

const AddDishForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: ''
    });

    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price||!formData.image) {
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
        <div className="register-page-container min-vh-100 py-5">
            <BackgroundDoodles />

            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        
                        {/* Title Section - Outside the card, just like SetupForm */}
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">Add New Dish</h2>
                            <p className="text-muted">Enter the details to add a new dish to your menu.</p>
                        </div>

                        {/* Card Section - Standard Bootstrap card */}
                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                <FormInput name="name" label="Dish Name" type="text" value={formData.name} onChange={handleChange} required={true} />
                                <FormInput name="description" label="Description" type="text" value={formData.description} onChange={handleChange} required={true} />
                                <FormInput name="price" label="Price (₪)" type="number" value={formData.price} onChange={handleChange} required={true} />
                                <FormInput name="image" label="Image URL" type="url" value={formData.image} onChange={handleChange} placeholder="https://..." required={true} />
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3">
                                    Add Dish
                                </button>
                            </form>

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