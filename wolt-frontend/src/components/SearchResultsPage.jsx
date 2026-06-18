import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './searchResultsPage.css';

function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const query = searchParams.get('q') || '';
    const target = searchParams.get('target') || 'venues'; 

    const [results, setResults] = useState({ restaurants: [], items: [] });
    const [isLoading, setIsLoading] = useState(false);

    const handleImageError = (e) => {
        e.target.src = '/icon.svg'; 
    };

    useEffect(() => {
        if (!query.trim()) return;

        const fetchAllResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/restaurants/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    const restaurants = data.restaurants || [];
                    const mappedItems = (data.relatedProducts || []).map(product => {
                        const matched = restaurants.find(r => r._id === product.restaurantId);
                        return {
                            ...product,
                            restaurantName: matched ? matched.name : 'Restaurant',
                            restaurantAddress: matched ? matched.address : 'Address available'
                        };
                    });

                    setResults({
                        restaurants: restaurants,
                        items: mappedItems
                    });
                }
            } catch (error) {
                console.error("Error fetching full search results:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllResults();
    }, [query]);

    return (
        <div className="wolt-results-page">
            <div className="wolt-page-container">
                <h1 className="wolt-page-title">Search Results</h1>
                
                {isLoading && <div className="wolt-page-status">Loading results...</div>}

                {!isLoading && (
                    <>
                        {target === 'venues' && (
                            <div className="wolt-page-block">
                                <h2 className="wolt-block-title">restaurants</h2>
                                {results.restaurants.length === 0 ? (
                                    <p className="wolt-no-results">No restaurants found matching "{query}"</p>
                                ) : (
                                    <div className="wolt-page-venues-grid">
                                        {results.restaurants.map((restaurant) => (
                                            <div 
                                                key={restaurant._id} 
                                                className="wolt-page-venue-card"
                                                onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                                            >
                                                <img 
                                                    src={restaurant.image || '/icon.svg'} 
                                                    alt={restaurant.name} 
                                                    onError={handleImageError} 
                                                />
                                                <div className="wolt-page-venue-info">
                                                    <h3>{restaurant.name}</h3>
                                                    <p className="wolt-page-venue-cuisine">
                                                        {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                                                    </p>
                                                    <div className="wolt-page-venue-meta">
                                                        <span>⚡ Fast Delivery</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {target === 'items' && (
                            <div className="wolt-page-block">
                                <h2 className="wolt-block-title">Related Items</h2>
                                {results.items.length === 0 ? (
                                    <p className="wolt-no-results">No items found matching "{query}"</p>
                                ) : (
                                    <div className="wolt-page-products-grid">
                                        {results.items.map((product) => (
                                            <div 
                                                key={product._id} 
                                                className="wolt-page-product-card"
                                                onClick={() => navigate(`/restaurant/${product.restaurantId}`)}
                                            >
                                                <div className="wolt-page-product-img-wrapper">
                                                    <img 
                                                        src={product.image || '/icon.svg'} 
                                                        alt={product.name} 
                                                        onError={handleImageError} 
                                                    />
                                                </div>
                                                <div className="wolt-page-product-info">
                                                    <span className="wolt-page-product-price">${product.price}</span>
                                                    <h3>{product.name}</h3>
                                                    <p className="wolt-page-product-meta">
                                                        {product.restaurantName} | {product.restaurantAddress}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchResultsPage;