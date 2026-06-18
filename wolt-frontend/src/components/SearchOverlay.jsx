import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './searchOverlay.css';

function SearchOverlay({ searchQuery, setSearchQuery, onClose }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [recentSearches, setRecentSearches] = useState([]);
    const [liveResults, setLiveResults] = useState({ restaurants: [], items: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedSearches = localStorage.getItem('recent_searches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlQuery = searchParams.get('q');
        if (urlQuery && (!searchQuery || searchQuery.trim() === '')) {
            setSearchQuery(urlQuery);
        }
    }, []); 

    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setLiveResults({ restaurants: [], items: [] });
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/restaurants/search?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    const restaurants = data.restaurants || [];
                    const rawItems = data.relatedProducts || [];

const mappedItems = rawItems.map(product => {
    const matchedRestaurant = restaurants.find(r => 
        r._id === product.restaurantId || 
        r._id === product.restaurantID || 
        r._id === product.restaurant ||
        r._id === product.restaurant_id
    );
    
    return {
        ...product,
        restaurantId: matchedRestaurant ? matchedRestaurant._id : null,
        restaurantName: matchedRestaurant ? matchedRestaurant.name : 'Restaurant',
        restaurantAddress: matchedRestaurant ? matchedRestaurant.address : 'Address available'
    };
});

                    setLiveResults({
                        restaurants: restaurants,
                        items: mappedItems
                    });
                }
            } catch (error) {
                console.error("Error fetching live search results:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const saveSearch = (queryStr) => {
        if (!queryStr.trim()) return;
        const updated = [queryStr, ...recentSearches.filter(s => s !== queryStr)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    };

    const handleImageError = (e) => {
    e.target.src = '/icon.svg'; 
};

    const handleRecentClick = (search) => {
        setSearchQuery(search);
    };

    const handleItemClick = (url, name) => {
        saveSearch(name);
        onClose();
        navigate(url);
    };

    const isQueryEmpty = !searchQuery || searchQuery.trim() === '';

    return (
        <div className="wolt-style-overlay" onClick={onClose}>
            <div className="wolt-style-content" onClick={(e) => e.stopPropagation()}>
                
                <button className="wolt-close-btn" onClick={onClose}>✕</button>

                <div className="wolt-overlay-body">
                    
                    {isQueryEmpty && (
                        <div className="wolt-recent-section">
                            <h2>Recent Searches</h2>
                            {recentSearches.length > 0 ? (
                                <ul className="wolt-recent-list">
                                    {recentSearches.map((search, index) => (
                                        <li key={index} onClick={() => handleRecentClick(search)}>
                                            <span className="wolt-clock">🕒</span>
                                            <span className="wolt-text">{search}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="wolt-empty-text">No recent searches yet.</p>
                            )}
                        </div>
                    )}

                    {!isQueryEmpty && (
                        <div className="wolt-results-section">
                            {isLoading && <div className="wolt-status-text">Searching...</div>}
                            
                            {!isLoading && liveResults.restaurants.length === 0 && liveResults.items.length === 0 && (
                                <div className="wolt-status-text">No results found for "{searchQuery}"</div>
                            )}

                            {liveResults.restaurants.length > 0 && (
                                <div className="wolt-category-block">
                                    <div className="wolt-category-header">
                                        <h2>Places</h2>
                                        <span className="wolt-view-all" onClick={() => { 
                                            saveSearch(searchQuery);
                                            onClose(); 
                                            navigate(`/search-results?q=${encodeURIComponent(searchQuery)}&target=venues`); 
                                            }}
                                        >
                                            View all places
                                        </span>
                                    </div>
                                    <div className="wolt-venues-row">
                                        {liveResults.restaurants.map((restaurant) => (
                                            <div 
                                                key={restaurant._id} 
                                                className="wolt-custom-venue-card"
                                                onClick={() => handleItemClick(`/restaurant/${restaurant._id}`, restaurant.name)}
                                            >
                                                <img 
                                                    src={restaurant.image || '/icon.svg'} 
                                                    alt={restaurant.name} 
                                                    onError={handleImageError} 
                                                />
                                                <div className="wolt-custom-venue-info">
                                                    <h3>{restaurant.name}</h3>
                                                    <p>{Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : (restaurant.cuisine || '')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {liveResults.items.length > 0 && (
                                <div className="wolt-category-block">
                                    <hr className="wolt-block-divider" />
                                    <div className="wolt-category-header">
                                        <h2>Related Items</h2>
                                        <span className="wolt-view-all" onClick={() => { 
                                            saveSearch(searchQuery);
                                            onClose(); 
                                            navigate(`/search-results?q=${encodeURIComponent(searchQuery)}&target=items`); 
                                            }}
                                        >
                                            View all products
                                        </span>
                                    </div>
                                    <div className="wolt-products-two-columns">
                                        {liveResults.items.map((product) => (
                                            <div 
                                                key={product._id} 
                                                className="wolt-custom-product-card"
                                                onClick={() => {
                                                    const matchedRestaurant = liveResults.restaurants.find(restaurant => {
                                                        if (restaurant.products && Array.isArray(restaurant.products)) {
                                                            return restaurant.products.some(prod => 
                                                                (typeof prod === 'string' && prod === product._id) || 
                                                                (prod._id === product._id) || 
                                                                (prod.id === product._id)
                                                            );
                                                        }
                                                        return false;
                                                    });

                                                    if (matchedRestaurant) {
                                                        handleItemClick(`/restaurant/${matchedRestaurant._id}`, product.name);
                                                    } else {
                                                        const matchedByMenu = liveResults.restaurants.find(restaurant => {
                                                            if (restaurant.menu && Array.isArray(restaurant.menu)) {
                                                                return restaurant.menu.some(prod => prod === product._id || prod._id === product._id);
                                                            }
                                                            return false;
                                                        });

                                                        if (matchedByMenu) {
                                                            handleItemClick(`/restaurant/${matchedByMenu._id}`, product.name);
                                                        } 
                                                    }
                                                }}
                                            >
                                                <img 
                                                    src={product.image || '/icon.svg'} 
                                                    alt={product.name} 
                                                    onError={handleImageError} 
                                                />
                                                <div className="wolt-product-details">
                                                    <span className="wolt-product-price">${product.price}</span>
                                                    <h3 className="wolt-product-title">{product.name}</h3>
                                                    <p className="wolt-product-meta">
                                                        {product.restaurantName} | {product.restaurantAddress}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
}

export default SearchOverlay;