import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard'; 

const RestaurantFeed = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/restaurants');
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                const data = await response.json();
                setRestaurants(data);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading restaurants...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger m-3 text-center">Error: {error}</div>;
    }

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold m-0">Restaurants:</h2>
                    <p className="text-muted m-0">Explore our curated list of available kitchens</p>
                </div>
                <span className="badge bg-secondary p-2">{restaurants.length} Places Nearby</span>
            </div>
            
            <div className="row">
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                        <RestaurantCard 
                            key={restaurant._id || restaurant.id} 
                            restaurant={restaurant} 
                        />
                    ))
                ) : (
                    <div className="text-center p-5">
                        <p className="text-muted">No restaurants available right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantFeed;