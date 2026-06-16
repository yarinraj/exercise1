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
                                    <div className="card h-100 border-0 shadow-sm">
                                        <img
                                            src={res.image}
                                            className="card-img-top"
                                            alt={res.name}
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{res.name}</h5>
                                            <p className="card-text text-muted">{res.cuisine}</p>

                                            {/* Action buttons for Edit and Delete */}
                                            <div className="d-flex justify-content-between align-items-center mt-3">
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