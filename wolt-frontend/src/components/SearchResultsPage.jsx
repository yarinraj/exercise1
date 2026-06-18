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

    const getProductRestaurantId = (product, restaurants) => {
        const directRestaurantId =
            product.restaurantId ||
            product.restaurantID ||
            product.restaurant_id ||
            product.restaurant;

        if (directRestaurantId) {
            return directRestaurantId;
        }

        const matchedRestaurant = restaurants.find((restaurant) => {
            const products = restaurant.products || restaurant.menu || [];

            return products.some((restaurantProduct) => {
                if (typeof restaurantProduct === 'string') {
                    return restaurantProduct === product._id || restaurantProduct === product.id;
                }

                return (
                    restaurantProduct._id === product._id ||
                    restaurantProduct.id === product.id ||
                    restaurantProduct._id === product.id ||
                    restaurantProduct.id === product._id
                );
            });
        });

        return matchedRestaurant ? matchedRestaurant._id || matchedRestaurant.id : null;
    };

    useEffect(() => {
        if (!query.trim()) return;

        const fetchAllResults = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(
                    `/api/restaurants/search?q=${encodeURIComponent(query)}`
                );

                if (response.ok) {
                    const data = await response.json();

                    const restaurants = data.restaurants || [];

                    const mappedItems = (data.relatedProducts || []).map((product) => {
                        const restaurantId = getProductRestaurantId(product, restaurants);

                        const matchedRestaurant = restaurants.find((restaurant) => {
                            return (
                                restaurant._id === restaurantId ||
                                restaurant.id === restaurantId
                            );
                        });

                        return {
                            ...product,
                            restaurantId,
                            restaurantName: matchedRestaurant
                                ? matchedRestaurant.name
                                : 'Restaurant',
                            restaurantAddress: matchedRestaurant
                                ? matchedRestaurant.address
                                : 'Address available'
                        };
                    });

                    setResults({
                        restaurants,
                        items: mappedItems
                    });
                }
            } catch (error) {
                console.error('Error fetching full search results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllResults();
    }, [query]);

    const handleProductClick = (product) => {
        if (!product.restaurantId) {
            console.error('Missing restaurantId for product:', product);
            return;
        }

        navigate(`/restaurant/${product.restaurantId}`);
    };

    return (
        <div className="wolt-results-page">
            <div className="wolt-page-container">
                <h1 className="wolt-page-title">Search Results</h1>

                {isLoading && (
                    <div className="wolt-page-status">
                        Loading results...
                    </div>
                )}

                {!isLoading && (
                    <>
                        {target === 'venues' && (
                            <div className="wolt-page-block">
                                <h2 className="wolt-block-title">Restaurants</h2>

                                {results.restaurants.length === 0 ? (
                                    <p className="wolt-no-results">
                                        No restaurants found matching "{query}"
                                    </p>
                                ) : (
                                    <div className="wolt-page-venues-grid">
                                        {results.restaurants.map((restaurant) => (
                                            <div
                                                key={restaurant._id || restaurant.id}
                                                className="wolt-page-venue-card"
                                                onClick={() =>
                                                    navigate(`/restaurant/${restaurant._id || restaurant.id}`)
                                                }
                                            >
                                                <img
                                                    src={restaurant.image || '/icon.svg'}
                                                    alt={restaurant.name}
                                                    onError={handleImageError}
                                                />

                                                <div className="wolt-page-venue-info">
                                                    <h3>{restaurant.name}</h3>

                                                    <p className="wolt-page-venue-cuisine">
                                                        {Array.isArray(restaurant.cuisine)
                                                            ? restaurant.cuisine.join(', ')
                                                            : restaurant.cuisine}
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
                                    <p className="wolt-no-results">
                                        No items found matching "{query}"
                                    </p>
                                ) : (
                                    <div className="wolt-page-products-grid">
                                        {results.items.map((product) => (
                                            <div
                                                key={product._id || product.id}
                                                className="wolt-page-product-card"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <div className="wolt-page-product-img-wrapper">
                                                    <img
                                                        src={product.image || '/icon.svg'}
                                                        alt={product.name}
                                                        onError={handleImageError}
                                                    />
                                                </div>

                                                <div className="wolt-page-product-info">
                                                    <span className="wolt-page-product-price">
                                                        ₪{product.price}
                                                    </span>

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