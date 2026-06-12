import React, { useState, useEffect } from 'react';

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
        return <div className="text-center p-5">Loading restaurants...</div>;
    }

    if (error) {
        return <div className="alert alert-danger m-3 text-center">Error: {error}</div>;
    }

    return (
        <div className="container p-4">
            <h2 className="mb-4">📢 Dynamic Restaurant Feed (Task EX1-143)</h2>
            <p className="text-muted">Successfully connected to backend! Found {restaurants.length} restaurants.</p>
            
            <ul className="list-group">
                {restaurants.map((restaurant) => (
                    <li key={restaurant._id || restaurant.id} className="list-group-item">
                        <strong>{restaurant.name}</strong> - {restaurant.cuisine || 'No culinary tag'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RestaurantFeed;