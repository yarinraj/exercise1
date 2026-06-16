import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * EditRestaurantForm Component
 * Allows restaurant owners to fully update their restaurant details.
 */
const EditRestaurantForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        description: '',
        phone: '',
        address: '',
        image: '',
        lat: '',
        lng: ''
    });

    const [statusMessage, setStatusMessage] = useState('');

    // Fetch existing restaurant data when component mounts
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${id}`);
                if (!response.ok) throw new Error('Failed to fetch restaurant details');
                
                const data = await response.json();
                
                // Set form state with fetched data, mapping relevant fields only
                setFormData({
                    name: data.name || '',
                    cuisine: data.cuisine || '',
                    description: data.description || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    image: data.image || '',
                    lat: data.lat || '',
                    lng: data.lng || ''
                });
            } catch (error) {
                setStatusMessage('❌ Error loading restaurant data.');
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

   const handleUpdate = async (e) => {
    e.preventDefault();
    setStatusMessage('Updating...');

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            setStatusMessage('❌ You are not logged in.');
            return;
        }

        const dataToUpdate = {
            name: formData.name,
            cuisine: formData.cuisine,
            description: formData.description,
            phone: formData.phone,
            address: formData.address,
            image: formData.image,
        };

        if (formData.lat !== '') {
            dataToUpdate.lat = Number(formData.lat);
        }

        if (formData.lng !== '') {
            dataToUpdate.lng = Number(formData.lng);
        }

        console.log('Updating restaurant id:', id);
        console.log('Payload:', dataToUpdate);

        const response = await fetch(`http://localhost:8080/api/restaurants/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dataToUpdate)
        });

        if (response.status === 204) {
            setStatusMessage('✅ Updated successfully!');
            setTimeout(() => navigate('/owner/dashboard'), 500);
            return;
        }

        const errorData = await response.json().catch(() => null);
        console.error('Update failed:', response.status, errorData);

        throw new Error(
            errorData?.error ||
            errorData?.message ||
            `Update failed with status ${response.status}`
        );
    } catch (error) {
        console.error('Update error:', error);
        setStatusMessage(`❌ ${error.message}`);
    }
};

    return (
        <div className="register-page-container min-vh-100 py-5">
            <BackgroundDoodles />
            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <h2 className="fw-bold text-center mb-4">Edit Restaurant</h2>
                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <form onSubmit={handleUpdate}>
                                <FormInput name="name" label="Name" type="text" value={formData.name} onChange={handleChange} />
                                <FormInput name="cuisine" label="Cuisine" type="text" value={formData.cuisine} onChange={handleChange} />
                                
                                <div className="wolt-input-group mb-3">
                                    <label className="wolt-label">Description</label>
                                    <textarea 
                                        className="wolt-input" 
                                        name="description" 
                                        rows="3" 
                                        value={formData.description} 
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <FormInput name="phone" label="Phone" type="tel" value={formData.phone} onChange={handleChange} />
                                <FormInput name="address" label="Address" type="text" value={formData.address} onChange={handleChange} />
                                <FormInput name="lat" label="Latitude" type="number" value={formData.lat} onChange={handleChange} />
                                <FormInput name="lng" label="Longitude" type="number" value={formData.lng} onChange={handleChange} />
                                <FormInput name="image" label="Image URL" type="url" value={formData.image} onChange={handleChange} />
                                
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold mt-3 py-2">
                                    Save Changes
                                </button>
                            </form>
                            
                            {statusMessage && (
                                <div className={`alert mt-3 text-center ${statusMessage.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                                    {statusMessage}
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