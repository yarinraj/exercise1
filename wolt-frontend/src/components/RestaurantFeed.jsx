import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard'; 

const RestaurantFeed = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); //the current state of filtering
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

    //filtering logic
    const filteredRestaurants = restaurants.filter(restaurant => {
        //only closer than 2 km
        if (activeFilter === 'nearby') {
            return restaurant.distance <= 2; 
        }
        //only promoted
        if (activeFilter === 'promoted') {
            return restaurant.isPromoted === true; 
        }
        //all restaurants
        return true; 
    })

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
                <div className="text-start mb-4">
                    <h2 className="fw-bold m-0 text-dark">Restaurants:</h2>
                    <p className="text-muted m-0">Explore our curated list of available kitchens</p>
                </div>
                <span className="badge bg-secondary p-2">{filteredRestaurants.length} filter</span>
            </div>
            
            {/* filtering buttons */}
            <div className="d-flex gap-2 mb-4">
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All Places
                </button>
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'nearby' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('nearby')}
                >
                    📍 Nearby
                </button>
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'promoted' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('promoted')}
                >
                    ⭐ Promoted
                </button>
            </div>
            
            {activeFilter === 'nearby' && (
                <div className="text-start mb-3 animate__animated animate__fadeIn">
                    <small className="text-muted fw-semibold bg-light px-3 py-1.5 rounded-pill border">
                        Filtered to 2 km max from your destination
                    </small>
                </div>
            )}

            {/* the filtered restaurants*/}
            <div className="row">
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
                        <RestaurantCard 
                            key={restaurant._id || restaurant.id} 
                            restaurant={restaurant} 
                        />
                    ))
                ) : (
                    <div className="text-center p-5 w-100">
                        <p className="text-muted fs-5">No restaurants match this category right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantFeed;