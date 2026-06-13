import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard'; 
import Toast from './Toast'; 

const RestaurantFeed = ({ searchQuery }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationDenied(false);
                },
                (err) => {
                    console.error("Error fetching location:", err);
                    setLocationDenied(true);
                }
            );
        } else {
            setLocationDenied(true);
        }
    }, []);

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

    const getRealDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        return parseFloat((R * c).toFixed(1));
    };

    const handleFilterClick = (filterType) => {
        if (filterType === 'nearby' && locationDenied) {
            setToast({
                show: true,
                message: "Location access is required to view nearby restaurants. Please enable permissions in browser settings.",
                type: 'warning'
            });
            return; 
        }
        setActiveFilter(filterType);
    };

    const filteredRestaurants = restaurants
        .map(restaurant => {
            const distance = userLocation && restaurant.lat && restaurant.lng
                ? getRealDistance(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng)
                : null;

            return {
                ...restaurant,
                calculatedDistance: distance
            };
        })
        .filter(restaurant => {
            if (activeFilter === 'nearby') {
                if (locationDenied || restaurant.calculatedDistance === null) {
                    return false;
                }
                if (restaurant.calculatedDistance > 5) {
                    return false; 
                }
            }
            
            if (activeFilter === 'promoted' && restaurant.isPromoted !== true) {
                return false; 
            }
            
            const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
            if (query) {
                const matchesName = restaurant.name?.toLowerCase().includes(query);
                const matchesCuisine = restaurant.cuisine?.toLowerCase().includes(query);
                return matchesName || matchesCuisine;
            }

            return true; 
        });

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
            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="text-start mb-4">
                    <h2 className="fw-bold m-0 text-dark">Restaurants:</h2>
                    <p className="text-muted m-0">Explore our curated list of available kitchens</p>
                </div>
                <span className="badge bg-secondary p-2">{filteredRestaurants.length} Places Found</span>
            </div>
            
            {/* filtering buttons */}
            <div className="d-flex gap-2 mb-4">
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleFilterClick('all')}
                >
                    All Places
                </button>
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'nearby' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleFilterClick('nearby')}
                >
                    📍 Nearby
                </button>
                <button 
                    className={`btn rounded-pill fw-bold px-4 ${activeFilter === 'promoted' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleFilterClick('promoted')}
                >
                    ⭐ Promoted
                </button>
            </div>
            
            {activeFilter === 'nearby' && !locationDenied && (
                <div className="text-start mb-3 animate__animated animate__fadeIn">
                    <small className="text-muted fw-semibold bg-light px-3 py-1.5 rounded-pill border">
                        Filtered to 5 km max from your location
                    </small>
                </div>
            )}

            {/* the filtered restaurants */}
            <div className="row">
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
                        <RestaurantCard 
                            key={restaurant._id || restaurant.id} 
                            restaurant={{
                                ...restaurant,
                                distance: restaurant.calculatedDistance !== null 
                                    ? `${restaurant.calculatedDistance} km` 
                                    : "Location unavailable"
                            }} 
                        />
                    ))
                ) : (
                    <div className="text-center p-5 w-100">
                        <p className="text-muted fs-5">No restaurants match your search or category criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantFeed;