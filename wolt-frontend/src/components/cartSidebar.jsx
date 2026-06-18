import React, { useState, useEffect } from 'react';
import { useCart } from '../context/cart';

export const CartSidebar = ({ isOpen, onClose }) => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        totalPrice,
        totalItems,
        clearCart,
        activeRestaurantId,
        addToCart,
        showToast,
} = useCart();

const [isDark, setIsDark] = useState(false);
const [recommendations, setRecommendations] = useState([]);
const [loadingRecs, setLoadingRecs] = useState(false);
const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    useEffect(() => {
        const determineTheme = () => {
            const htmlAttr =
                document.documentElement.getAttribute('data-bs-theme') ||
                document.documentElement.getAttribute('data-theme') ||
                '';

            const bodyAttr =
                document.body.getAttribute('data-bs-theme') ||
                document.body.getAttribute('data-theme') ||
                '';

            const classes = [
                ...document.body.classList,
                ...document.documentElement.classList
            ];

            const hasDarkClass = classes.some((c) =>
                c.toLowerCase().includes('dark')
            );

            setIsDark(
                htmlAttr.includes('dark') ||
                bodyAttr.includes('dark') ||
                hasDarkClass
            );
        };

        determineTheme();

        const observer = new MutationObserver(determineTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-bs-theme', 'data-theme']
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'data-bs-theme', 'data-theme']
        });

        return () => observer.disconnect();
    }, []);

    // Fetch recommendations and ensure they only belong to the active restaurant
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!isOpen || cartItems.length === 0 || !activeRestaurantId) {
                setRecommendations([]);
                return;
            }

            try {
                setLoadingRecs(true);
                const token = localStorage.getItem('token');
                const currentProductId = cartItems[0]._id || cartItems[0].id;

                // 1. Fetch the active restaurant FIRST to get the definitive list of valid products
                const restaurantResponse = await fetch(`http://localhost:8080/api/restaurants/${activeRestaurantId}`);
                let validRestaurantProducts = [];
                if (restaurantResponse.ok) {
                    const restaurantData = await restaurantResponse.json();
                    validRestaurantProducts = restaurantData.products || [];
                }

                const cartIds = new Set(cartItems.map(item => item._id || item.id));
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // 2. Fetch recommendations from the C++ backend gateway
                const response = await fetch(
                    `http://localhost:8080/api/recommendations?productId=${currentProductId}&restaurantId=${activeRestaurantId}`,
                    { headers }
                );

                let finalRecommendations = [];

                if (response.ok) {
                    const data = await response.json();

                    // Handle the specific JSON structure: {"success": true, "recommendedIds": [...]}
                    let recIds = [];
                    if (data.success && Array.isArray(data.recommendedIds)) {
                        recIds = data.recommendedIds;
                    } else if (Array.isArray(data)) {
                        recIds = data.map(item => typeof item === 'object' ? (item._id || item.id) : item);
                    }

                    // 3. Absolute Filter: Map the recommended IDs only to products that exist in THIS restaurant
                    finalRecommendations = validRestaurantProducts.filter(prod =>
                        recIds.includes(prod._id || prod.id) && !cartIds.has(prod._id || prod.id)
                    );
                }

                // 4. Smart Fallback: If C++ returned empty or no matches found, fallback to this restaurant's items
                if (finalRecommendations.length === 0) {
                    finalRecommendations = validRestaurantProducts.filter(prod => !cartIds.has(prod._id || prod.id));
                }

                // Set up to 3 recommendations
                setRecommendations(finalRecommendations.slice(0, 3));

            } catch (error) {
                console.error("Failed fetching recommendations:", error);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecommendations();
    }, [isOpen, cartItems.length, activeRestaurantId]);

    // Robust wrapper to guarantee the product is recognized as belonging to the current restaurant
    const handleAddRecommendation = (prod) => {
        if (!addToCart) return;

        let enrichedProduct = { ...prod };

        if (cartItems.length > 0) {
            // Extract the first item in the cart to mirror its restaurant structure exactly
            const referenceItem = cartItems[0];

            enrichedProduct = {
                ...enrichedProduct,
                restaurantId: referenceItem.restaurantId || activeRestaurantId,
                restaurant: referenceItem.restaurant || activeRestaurantId,
                // Covering edge cases where the key might be slightly different
                restaurant_id: referenceItem.restaurant_id
            };
        } else {
            enrichedProduct.restaurantId = activeRestaurantId;
            enrichedProduct.restaurant = activeRestaurantId;
        }

        // Pass the enriched product, and also pass activeRestaurantId as a second argument 
        // in case your Context API signature expects addToCart(item, restaurantId)
        addToCart(enrichedProduct, activeRestaurantId);
    };

    if (!isOpen) return null;

    // Handles the secure checkout process
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty.', 'warning');
            return;
        }

        if (!activeRestaurantId) {
            showToast('Missing restaurant information for this order.', 'error');
            return;
        }

        if (isSubmittingOrder) {
            return;
        }

        const token = localStorage.getItem('token');

        const orderPayload = {
            restaurantId: activeRestaurantId,
            products: cartItems.map(item => ({
                productId: item._id || item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        const requestHeaders = {
            'Content-Type': 'application/json'
        };

        if (token) {
            requestHeaders.Authorization = `Bearer ${token}`;
        }

        try {
            setIsSubmittingOrder(true);
            showToast('Placing your order...', 'info');

            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json().catch(() => null);

            if (response.ok || response.status === 201) {
                showToast(
                    `Order placed successfully! Order ID: ${data?._id || data?.id || 'created'}`,
                    'success'
                );

                setTimeout(() => {
                    clearCart({ silent: true });
                    onClose();
                }, 1800);

                return;
            }

            showToast(
                data?.error ||
                data?.message ||
                'Failed to place order. Please try again.',
                'error'
            );
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Server error. Please try again later.', 'error');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    return (
        <>
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1040,
                    backdropFilter: 'blur(3px)'
                }}
                onClick={onClose}
            />

            <div
                className="position-fixed top-0 end-0 h-100 d-flex flex-column shadow-lg"
                style={{
                    width: '400px',
                    backgroundColor: isDark ? '#12161f' : '#ffffff',
                    borderLeft: isDark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                    zIndex: 1050,
                    color: isDark ? '#fff' : '#212529',
                    transition: 'background-color 0.2s ease, color 0.2s ease'
                }}
            >
                <div
                    className="p-4 d-flex justify-content-between align-items-center"
                    style={{
                        borderBottom: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)'
                    }}
                >
                    <h5
                        className="mb-0 fw-bold d-flex align-items-center gap-2"
                        style={{ color: isDark ? '#fff' : '#212529' }}
                    >
                        🛒 Your Cart

                        <span
                            className="badge rounded-pill fs-6"
                            style={{
                                backgroundColor: '#00c2e8',
                                color: '#fff'
                            }}
                        >
                            {totalItems}
                        </span>
                    </h5>

                    <button
                        className="btn p-0 fs-4 opacity-75"
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            color: isDark ? '#fff' : '#212529'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div className="flex-grow-1 overflow-auto p-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-muted mt-5 py-5">
                            <p className="fw-bold mb-1">Your cart is empty</p>
                            <small>Add delicious items from a restaurant to start!</small>
                        </div>
                    ) : (
                        <>
                            {/* List of current items in the cart */}
                            {cartItems.map(item => (
                                <div key={item._id || item.id} className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                    <div className="d-flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                        <img
                                            src={(item.image && item.image.trim() !== '') ? item.image : '/icon.svg'}
                                            alt={item.name}
                                            className="rounded-2"
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                objectFit: (item.image && item.image.trim() !== '') ? 'cover' : 'contain',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #eaeaea',
                                                padding: (item.image && item.image.trim() !== '') ? '0' : '5px',
                                                flexShrink: 0
                                            }}
                                        />

                                        <div style={{ minWidth: 0 }}>
                                            <h6
                                                className="mb-1 fw-bold text-truncate"
                                                style={{
                                                    maxWidth: '130px',
                                                    color: isDark ? '#fff' : '#212529'
                                                }}
                                            >
                                                {item.name}
                                            </h6>

                                            <span className="fw-bold small" style={{ color: '#00c2e8' }}>
                                                ₪{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 rounded-2 p-1"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                                        <button className="btn btn-sm border-0 py-0 px-2 fw-bold"
                                            style={{ color: isDark ? '#fff' : '#212529', backgroundColor: 'transparent' }}
                                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}>-</button>
                                        <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', color: isDark ? '#fff' : '#212529' }}>{item.quantity}</span>
                                        <button className="btn btn-sm border-0 py-0 px-2 fw-bold"
                                            style={{ color: isDark ? '#fff' : '#212529', backgroundColor: 'transparent' }}
                                            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}>+</button>
                                    </div>

                                    <button className="btn btn-sm text-danger ms-2 border-0" onClick={() => removeFromCart(item._id || item.id)}>
                                        Remove
                                    </button>
                                </div>
                            ))}

                            {/* Smart recommendations section with thumbnails */}
                            {recommendations.length > 0 && !loadingRecs && (
                                <div className="mt-5 pt-2 animate__animated animate__fadeIn">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: isDark ? '#fff' : '#212529' }}>
                                        Recommended for you
                                    </h6>
                                    <div className="d-flex flex-column gap-2">
                                        {recommendations.map(prod => (
                                            <div key={prod._id || prod.id}
                                                className="d-flex justify-content-between align-items-center p-2 rounded-3"
                                                style={{
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                                    border: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {/* Layout combining image, name, and price */}
                                                <div className="d-flex align-items-center gap-2" style={{ flex: 1, textAlign: 'left' }}>
                                                    <img
                                                        src={(prod.image && prod.image.trim() !== '') ? prod.image : '/icon.svg'}
                                                        alt={prod.name}
                                                        className="rounded-2"
                                                        style={{
                                                            width: '42px',
                                                            height: '42px',
                                                            objectFit: (prod.image && prod.image.trim() !== '') ? 'cover' : 'contain',
                                                            backgroundColor: '#f8f9fa',
                                                            border: '1px solid #eaeaea',
                                                            padding: (prod.image && prod.image.trim() !== '') ? '0' : '5px'
                                                        }}
                                                    />
                                                    <div className="text-start">
                                                        <span className="d-block fw-semibold small text-truncate" style={{ maxWidth: '160px', color: isDark ? '#f1f5f9' : '#334155' }}>
                                                            {prod.name}
                                                        </span>
                                                        <small className="fw-bold" style={{ color: '#00c2e8' }}>₪{prod.price}</small>
                                                    </div>
                                                </div>

                                                {/* Quick add button calls the new wrapper function */}
                                                <button
                                                    className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm"
                                                    style={{ backgroundColor: '#00c2e8', fontSize: '0.8rem', border: 'none' }}
                                                    onClick={() => handleAddRecommendation(prod)}
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Section */}
                {cartItems.length > 0 && (
                    <div className="p-4"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
                        }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted fw-bold">Total Price:</span>

                            <span
                                className="fs-4 fw-bold"
                                style={{ color: isDark ? '#fff' : '#212529' }}
                            >
                                ₪{totalPrice.toFixed(2)}
                            </span>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-danger btn-sm px-3 rounded-3"
                                onClick={clearCart}
                                title="Clear Cart"
                                disabled={isSubmittingOrder}
                            >
                                Clear
                            </button>

                            <button
                                className="btn flex-grow-1 fw-bold py-2 rounded-3 text-white shadow-sm"
                                style={{
                                    backgroundColor: isSubmittingOrder
                                        ? '#8adfeb'
                                        : '#00c2e8',
                                    boxShadow: '0 4px 15px rgba(0, 194, 232, 0.3)',
                                    border: 'none',
                                    cursor: isSubmittingOrder ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleCheckout}
                                disabled={isSubmittingOrder}
                            >
                                {isSubmittingOrder
                                    ? 'Placing order...'
                                    : 'Secure Checkout ➔'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};