import React, { useState, useEffect } from 'react';
import { useCart } from '../context/cart';

export const CartSidebar = ({ isOpen, onClose }) => {
    // FIX: Added 'activeRestaurantId' to the destructured variables from useCart
    const { cartItems, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart, activeRestaurantId } = useCart();

    const [isDark, setIsDark] = useState(false);

    // Theme detection logic to seamlessly match the main app's dark/light mode
    useEffect(() => {
        const determineTheme = () => {
            const htmlAttr = document.documentElement.getAttribute('data-bs-theme') || document.documentElement.getAttribute('data-theme') || '';
            const bodyAttr = document.body.getAttribute('data-bs-theme') || document.body.getAttribute('data-theme') || '';
            const classes = [...document.body.classList, ...document.documentElement.classList];
            const hasDarkClass = classes.some(c => c.toLowerCase().includes('dark'));
            
            setIsDark(htmlAttr.includes('dark') || bodyAttr.includes('dark') || hasDarkClass);
        };

        determineTheme();

        // Observer to listen for theme changes in real-time
        const observer = new MutationObserver(determineTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-bs-theme', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-bs-theme', 'data-theme'] });

        return () => observer.disconnect();
    }, []);

    // Do not render the sidebar if it's not open
    if (!isOpen) return null;

    // Handles the secure checkout process
    const handleCheckout = async () => {
        // 1. Retrieve the JWT token from local storage for authorization
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('❌ You must be logged in to place an order.');
            return;
        }

        if (cartItems.length === 0) return;

        // 2. Prepare the payload for the backend
        // FIX: Using activeRestaurantId directly from the CartContext instead of guessing from cartItems
        const orderPayload = {
            restaurantId: activeRestaurantId, 
            products: cartItems.map(item => ({
                productId: item._id, // Mapping the frontend item ID to what the backend expects
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            // 3. Send the POST request to the orders API
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Attaching the JWT for security
                },
                body: JSON.stringify(orderPayload)
            });

            // 4. Handle success response
            if (response.ok || response.status === 201) {
                const data = await response.json();
                alert('✅ Order placed successfully! Order ID: ' + data._id);
                
                // 5. Clean up: clear the cart and close the sidebar upon successful order
                clearCart();
                onClose();
            } else {
                // Handle backend validation errors gracefully
                const errorData = await response.json().catch(() => null);
                alert(`❌ Failed to place order: ${errorData?.error || 'Unknown error'}`);
            }
        } catch (error) {
            // Handle network or unexpected errors
            console.error('Checkout error:', error);
            alert('❌ Server error. Please try again later.');
        }
    };

    return (
        <>
            {/* Backdrop overlay that closes the sidebar when clicked */}
            <div className="position-fixed top-0 start-0 w-100 h-100" 
                 style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, backdropFilter: 'blur(3px)' }}
                 onClick={onClose} 
            />

            {/* Main Sidebar Container */}
            <div className="position-fixed top-0 end-0 h-100 d-flex flex-column shadow-lg"
                 style={{ 
                     width: '400px', 
                     backgroundColor: isDark ? '#12161f' : '#ffffff', 
                     borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                     zIndex: 1050,
                     color: isDark ? '#fff' : '#212529',
                     transition: 'background-color 0.2s ease, color 0.2s ease'
                 }}
            >
                {/* Header Section: Cart Title and Close Button */}
                <div className="p-4 d-flex justify-content-between align-items-center" 
                     style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: isDark ? '#fff' : '#212529' }}>
                        🛒 Your Cart 
                        <span className="badge rounded-pill fs-6" style={{ backgroundColor: '#00c2e8', color: '#fff' }}>
                            {totalItems}
                        </span>
                    </h5>
                    <button className="btn p-0 fs-4 opacity-75" onClick={onClose} style={{ border: 'none', background: 'none', color: isDark ? '#fff' : '#212529' }}>&times;</button>
                </div>

                {/* Cart Items List Area */}
                <div className="flex-grow-1 overflow-auto p-4">
                    {cartItems.length === 0 ? (
                        // Empty Cart State
                        <div className="text-center text-muted mt-5 py-5">
                            <div className="fs-1 mb-3">🍽️</div>
                            <p className="fw-bold mb-1">Your cart is empty</p>
                            <small>Add delicious items from a restaurant to start!</small>
                        </div>
                    ) : (
                        // Render Cart Items
                        cartItems.map(item => (
                            <div key={item._id} className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" 
                                 style={{ 
                                     backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', 
                                     border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' 
                                 }}>
                                <div style={{ flex: 1 }}>
                                    <h6 className="mb-1 fw-bold text-truncate" style={{ maxWidth: '180px', color: isDark ? '#fff' : '#212529' }}>{item.name}</h6>
                                    <span className="fw-bold small" style={{ color: '#00c2e8' }}>
                                        ₪{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>

                                {/* Quantity Selector Component */}
                                <div className="d-flex align-items-center gap-2 rounded-2 p-1" 
                                     style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                                    <button className="btn btn-sm border-0 py-0 px-2 fw-bold" 
                                            style={{ color: isDark ? '#fff' : '#212529', backgroundColor: 'transparent' }}
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                                    <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', color: isDark ? '#fff' : '#212529' }}>{item.quantity}</span>
                                    <button className="btn btn-sm border-0 py-0 px-2 fw-bold" 
                                            style={{ color: isDark ? '#fff' : '#212529', backgroundColor: 'transparent' }}
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                </div>

                                {/* Remove from Cart Button */}
                                <button className="btn btn-sm text-danger ms-2 border-0" onClick={() => removeFromCart(item._id)}>
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section: Total Price and Checkout Buttons */}
                {cartItems.length > 0 && (
                    <div className="p-4" 
                         style={{ 
                             backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', 
                             borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' 
                         }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted fw-bold">Total Price:</span>
                            <span className="fs-4 fw-bold" style={{ color: isDark ? '#fff' : '#212529' }}>₪{totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-danger btn-sm px-3 rounded-3" onClick={clearCart} title="Clear Cart">
                                Clear
                            </button>
                            {/* Triggers the secure handleCheckout logic */}
                            <button className="btn flex-grow-1 fw-bold py-2 rounded-3 text-white shadow-sm"
                                    style={{ 
                                        backgroundColor: '#00c2e8',
                                        boxShadow: '0 4px 15px rgba(0, 194, 232, 0.3)',
                                        border: 'none'
                                    }}
                                    onClick={handleCheckout}
                            >
                                Secure Checkout ➔
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};