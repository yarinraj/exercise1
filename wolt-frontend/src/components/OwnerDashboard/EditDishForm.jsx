import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * EditDishForm Component
 * Fetches existing product details and allows the owner to update them.
 */
const EditDishForm = () => {
    const { id, productId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        price: '' 
    });
    
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products/${productId}`);
                if (!response.ok) throw new Error('Failed to fetch dish data');
                
                const data = await response.json();
                setFormData({ 
                    name: data.name || '', 
                    description: data.description || '', 
                    price: data.price || '' 
                });
            } catch (error) {
                setStatusMessage({ text: '❌ Failed to load dish data', type: 'alert-danger' });
            }
        };
        fetchDish();
    }, [id, productId]);

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
            setStatusMessage({ text: 'Updating...', type: 'alert-info' });
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products/${productId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatusMessage({ text: '✅ Dish updated successfully!', type: 'alert-success' });
                setTimeout(() => navigate(`/owner/edit/${id}/menu`), 500);
            } else {
                const errorData = await response.json();
                setStatusMessage({ text: `❌ ${errorData.error || 'Update failed'}`, type: 'alert-danger' });
            }
        } catch (error) {
            setStatusMessage({ text: '❌ Server error, please try again later.', type: 'alert-danger' });
        }
    };

  return (
        // Changed to 'register-page-container' to inherit the blue gradient background
        <div className="register-page-container min-vh-100 py-5">
            <BackgroundDoodles />
            <div className="container position-relative">
                {/* Adding 'register-card' class for the shadow and rounded corners effect */}
                <div className="register-card p-4 mx-auto" style={{ maxWidth: '500px' }}>
                    <h2 className="mb-4 text-center fw-bold">Edit Dish</h2>
                    <form onSubmit={handleSubmit}>
                        <FormInput name="name" label="Dish Name" type="text" value={formData.name} onChange={handleChange} />
                        <FormInput name="description" label="Description" type="text" value={formData.description} onChange={handleChange} />
                        <FormInput name="price" label="Price (₪)" type="number" value={formData.price} onChange={handleChange} />
                        
                        <button type="submit" className="wolt-btn-block rounded-pill fw-bold">
                            Update Dish
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
export default EditDishForm;