import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * OwnerDashboard Component
 * Displays a list of restaurants owned by the logged-in user.
 * Allows owners to edit, delete, or create new restaurants.
 */
const OwnerDashboard = () => {
    const [restaurant, setRestaurant] = useState(null);
    const navigate = useNavigate();

    // Fetch the owner's restaurants from the API
    useEffect(() => {
        const fetchMyRestaurants = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:8080/api/restaurants/my-restaurants', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();
                setRestaurant(data);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
            }
        };

        fetchMyRestaurants();
    }, []);

    // Handle toggling the promotion status of a restaurant
    const handleTogglePromote = async (id, currentStatus) => {
        // Confirmation message with the dynamic notice
        const message = currentStatus
            ? "Are you sure you want to stop promoting this restaurant?"
            : "Notice: Promoting your restaurant costs 199.90₪ a month. Would you like to activate premium promotion?";

        if (!window.confirm(message)) return;

        try {
            const token = localStorage.getItem('token');

            // Sending a PATCH request to update only the isPromoted field
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isPromoted: !currentStatus })
            });

            if (response.ok) {
                // Update local state immediately to reflect in UI
                setRestaurant(prevRestaurants =>
                    prevRestaurants.map(res =>
                        res._id === id ? { ...res, isPromoted: !currentStatus } : res
                    )
                );
            } else {
                alert('Failed to update promotion status. Please check your backend routes.');
            }
        } catch (error) {
            console.error('Promotion toggle error:', error);
        }
    };

    // Handle restaurant deletion
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Remove the deleted restaurant from the local state to update the UI immediately
                setRestaurant(restaurant.filter(res => res._id !== id));
            } else {
                alert('Failed to delete restaurant.');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="dashboard-container position-relative min-vh-100">
            <BackgroundDoodles />

            <div className="container py-5 position-relative">
                <h1 className="fw-bold mb-4">Owner Dashboard</h1>

                {/* Section: List of existing restaurants */}
                <section className="restaurant-info card p-4 mb-5 shadow-sm border-0 rounded-4">
                    <h3>My Restaurants</h3>
                    <div className="row">
                        {restaurant && restaurant.length > 0 ? (
                            restaurant.map((res) => (
                                <div key={res._id} className="col-md-4 mb-3">
                                    <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden">
                                        {/* Golden Premium Badge for Promoted Restaurants */}
                                        {res.isPromoted && (
                                            <span
                                                className="badge bg-warning text-dark position-absolute fw-bold shadow-sm"
                                                style={{ top: '10px', right: '10px', zIndex: 2, fontSize: '0.8rem' }}
                                            >
                                                ⭐ Promoted
                                            </span>
                                        )}
                                        {/* Dynamic Image Rendering */}
                                        {/* Uses the app logo (/icon.svg) with tailored styling if the image is missing */}
                                        <img
                                            src={(res.image && res.image.trim() !== '') ? res.image : '/icon.svg'}
                                            className="card-img-top"
                                            alt={res.name}
                                            style={{
                                                height: '150px',
                                                objectFit: (res.image && res.image.trim() !== '') ? 'cover' : 'contain',
                                                backgroundColor: (res.image && res.image.trim() !== '') ? 'transparent' : '#f8f9fa',
                                                padding: (res.image && res.image.trim() !== '') ? '0' : '20px'
                                            }}
                                        />

                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="card-title fw-bold">{res.name}</h5>
                                                <p className="card-text text-muted mb-3">{res.cuisine}</p>
                                            </div>

                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                        onClick={() => navigate(`/owner/edit/${res._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                                        onClick={() => navigate(`/owner/edit/${res._id}/menu`)}
                                                    >
                                                        Menu
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                        onClick={() => handleDelete(res._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                <div className="mt-2">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm w-100 rounded-pill fw-bold py-2 ${res.isPromoted
                                                                ? 'btn-warning text-dark shadow-sm'
                                                                : 'btn-outline-warning text-dark'
                                                            }`}
                                                        onClick={() => handleTogglePromote(res._id, res.isPromoted)}
                                                        style={{ fontSize: '0.85rem' }} 
                                                    >
                                                        {res.isPromoted ? '❌ Cancel Promotion' : '⭐ Promote'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">
                                No restaurants found. <Link to="/owner/setup">Create one now!</Link>
                            </p>
                        )}
                    </div>
                </section>

                {/* Section: Quick actions */}
                <section className="menu-management card p-4 shadow-sm border-0 rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Restaurant Actions</h3>
                        <Link to="/owner/setup" className="btn btn-primary rounded-pill px-4">
                            + Create New Restaurant
                        </Link>
                    </div>
                    <div className="menu-list">
                        <p className="text-muted">
                            {restaurant && restaurant.length > 0
                                ? "Select a restaurant above to manage its menu items or edit its details."
                                : "You don't have any restaurants yet. Create your first one to get started!"}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OwnerDashboard;