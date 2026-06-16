import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import for navigation
import BackgroundDoodles from '../common/BackgroundDoodles';

const OwnerDashboard = () => {
    const [restaurant, setRestaurant] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

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

    return (
        <div className="dashboard-container position-relative min-vh-100">
            <BackgroundDoodles />

            <div className="container py-5 position-relative">
                <h1 className="fw-bold mb-4">Owner Dashboard</h1>

                {/* Section: Dynamic Restaurant List */}
                <section className="restaurant-info card p-4 mb-5 shadow-sm border-0 rounded-4">
                    <h3>My Restaurants</h3>
                    <div className="row">
                        {restaurant && restaurant.length > 0 ? (
                            restaurant.map((res) => (
                                <div key={res._id} className="col-md-4 mb-3">
                                    <div
                                        className="card h-100 border-0 shadow-sm"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/owner/edit/${res._id}`)} // Navigate to edit page
                                    >
                                        <img src={res.image} className="card-img-top" alt={res.name} style={{ height: '150px', objectFit: 'cover' }} />
                                        <div className="card-body">
                                            <h5 className="card-title">{res.name}</h5>
                                            <p className="card-text text-muted">{res.cuisine}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No restaurants found. <a href="/owner/setup">Create one now!</a></p>
                        )}
                    </div>
                </section>

                {/* Section: Restaurant Management */}
                <section className="menu-management card p-4 shadow-sm border-0 rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Restaurant Actions</h3>

                        {/* Updated button to navigate to the setup form */}
                        <Link to="/owner/setup" className="btn btn-primary rounded-pill px-4">
                            + Create New Restaurant
                        </Link>
                    </div>

                    {/* Displaying menu help text */}
                    <div className="menu-list">
                        <p className="text-muted">
                            {restaurant && restaurant.length > 0
                                ? "Select a restaurant above to manage its menu items."
                                : "You don't have any restaurants yet. Create your first one to start adding menu items!"}
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default OwnerDashboard;