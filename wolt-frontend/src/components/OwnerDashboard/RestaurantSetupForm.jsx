import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * RestaurantSetupForm Component
 * Allows restaurant owners to register their business details, including location and cover image.
 */
const RestaurantSetupForm = () => {
  // Initial state for all restaurant fields
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

  // Track touched fields for real-time validation feedback
  const [touched, setTouched] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  // Handle changes in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Mark field as touched when user focuses out of it
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  };

  // Basic validation logic
  const isFieldValid = (fieldName) => {
    const value = formData[fieldName];
    if (fieldName === 'image') return value.startsWith('http');
    return value && value.trim() !== '';
  };

  // Submit form data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields upon submission
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    setStatusMessage('Creating restaurant...');

    const token = localStorage.getItem('token');
    if (!token) {
      setStatusMessage('Error: You are not logged in!');
      return;
    }

    try {
      // Prepare data, ensuring coordinates are parsed as numbers
      const dataToSend = {
        ...formData,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0,
        isPromoted: false
      };

      const response = await fetch('http://localhost:8080/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.status === 201) {
        setStatusMessage('✅ Restaurant created successfully!');
      } else {
        const errorData = await response.json();
        setStatusMessage(`❌ Error: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setStatusMessage('❌ Network error occurred.');
    }
  };

  return (
    // Relative wrapper for the background doodles
    <div className="register-page-container min-vh-100 py-5">
      <BackgroundDoodles />

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold">Restaurant Setup</h2>
              <p className="text-muted">Enter your restaurant details to get started.</p>
            </div>

            <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
              <form onSubmit={handleSubmit} noValidate>
                
                {/* Standard text inputs using custom FormInput component */}
                <FormInput
                  name="name" label="Restaurant Name" type="text"
                  value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., best restaurant" required={true}
                  wasValidated={touched.name} isValid={isFieldValid('name')}
                  errorFeedback="Please enter a valid restaurant name."
                />

                <FormInput
                  name="cuisine" label="Cuisine Type" type="text"
                  value={formData.cuisine} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., American, Italian" required={true}
                  wasValidated={touched.cuisine} isValid={isFieldValid('cuisine')}
                  errorFeedback="Cuisine type is required."
                />

                {/* Manual textarea for description */}
                <div className="wolt-input-group mb-3">
                  <label className="wolt-label">Description</label>
                  <textarea 
                    className={`wolt-input ${touched.description ? (isFieldValid('description') ? 'is-wolt-valid' : 'is-wolt-invalid') : ''}`}
                    name="description" rows="3" value={formData.description} 
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Tell us about your restaurant" required
                  ></textarea>
                </div>

                <FormInput
                  name="phone" label="Phone Number" type="tel"
                  value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 0501234567" required={true}
                  wasValidated={touched.phone} isValid={isFieldValid('phone')}
                />

                <FormInput
                  name="address" label="Address" type="text"
                  value={formData.address} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., Tel Aviv" required={true}
                  wasValidated={touched.address} isValid={isFieldValid('address')}
                />

                {/* Coordinate inputs */}
                <FormInput
                  name="lat" label="Latitude" type="number"
                  value={formData.lat} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 32.0697" required={true}
                  wasValidated={touched.lat} isValid={formData.lat !== ''}
                />

                <FormInput
                  name="lng" label="Longitude" type="number"
                  value={formData.lng} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 34.8010" required={true}
                  wasValidated={touched.lng} isValid={formData.lng !== ''}
                />

                {/* Image URL input */}
                <FormInput
                  name="image" label="Image URL" type="url"
                  value={formData.image} onChange={handleChange} onBlur={handleBlur}
                  placeholder="https://example.com/image.jpg" required={true}
                  wasValidated={touched.image} isValid={isFieldValid('image')}
                  errorFeedback="Please enter a valid image URL."
                />

                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3">
                  Create Restaurant
                </button>
              </form>

              {/* Status message area */}
              {statusMessage && (
                <div className={`alert mt-4 text-center rounded-3 ${
                  statusMessage.includes('✅') ? 'alert-success' : 
                  statusMessage.includes('❌') ? 'alert-danger' : 
                  'alert-info' 
                }`} role="alert">
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

export default RestaurantSetupForm;