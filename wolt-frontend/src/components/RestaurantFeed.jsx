import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard'; 
import ProductCard from './ProductCard'; 
import Toast from './Toast'; 

const RestaurantFeed = ({ searchQuery }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]); 
    const [activeFilter, setActiveFilter] = useState('all'); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [maxDistance, setMaxDistance] = useState(10);
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
                setLoading(true);
                
                let url = 'http://localhost:8080/api/restaurants';
                if (searchQuery && searchQuery.trim() !== '') {
                    url = `http://localhost:8080/api/restaurants/search?q=${encodeURIComponent(searchQuery)}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                const data = await response.json();
                
                if (data && data.restaurants) {
                    setRestaurants(data.restaurants);
                    setRelatedProducts(data.relatedProducts || []);
                } else if (Array.isArray(data)) {
                    setRestaurants(data);
                    setRelatedProducts([]);
                } else {
                    setRestaurants([]);
                    setRelatedProducts([]);
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [searchQuery]);

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
                if (restaurant.calculatedDistance > maxDistance) {
                    return false;
                }
            }

            if (activeFilter === 'promoted' && restaurant.isPromoted !== true) {
                return false;
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
                <div className="text-start mb-2">
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
                <div className="text-start mb-4 animate__animated animate__fadeIn">
                    <div className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill border shadow-sm">
                        <span className="text-muted fw-semibold me-1">Showing restaurants within</span>

                        <select
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            className="form-select-sm border-0 bg-transparent text-primary fw-bold p-0 pe-3"
                            style={{
                                cursor: 'pointer',
                                outline: 'none',
                                width: 'auto',
                                fontSize: '0.9rem',
                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23009de0\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right center',
                                backgroundSize: '10px',
                                appearance: 'none'
                            }}
                        >
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={20}>20 km</option>
                        </select>

                        <span className="text-muted fw-semibold ms-1">from you</span>
                    </div>
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
                        <p className="text-muted fs-5 feed-subtitle">No restaurants match your search or category criteria.</p>
                    </div>
                )}
            </div>

            {searchQuery && searchQuery.trim() !== '' && relatedProducts.length > 0 && (
                <div className="mt-0 text-start mb-5">
                    <hr style={{ opacity: 0.15, marginTop: '15px', marginBottom: '15px' }} />
                    <h3 className="fw-bold text-dark mb-1">Related Items:</h3>
                    <div className="row g-4 mt-2">
                        {relatedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantFeed;