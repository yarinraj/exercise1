import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('delivery_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [activeRestaurantId, setActiveRestaurantId] = useState(() => {
        return localStorage.getItem('delivery_cart_res_id') || null;
    });

    useEffect(() => {
        localStorage.setItem('delivery_cart', JSON.stringify(cartItems));
        localStorage.setItem('delivery_cart_res_id', activeRestaurantId || '');
    }, [cartItems, activeRestaurantId]);

    const addToCart = (product, restaurantId) => {
        if (activeRestaurantId && activeRestaurantId !== restaurantId) {
            const confirmClear = window.confirm(
                "You already have items from another restaurant in your cart. Clear cart and add this item?"
            );
            if (confirmClear) {
                setCartItems([{ ...product, quantity: 1 }]);
                setActiveRestaurantId(restaurantId);
            }
            return;
        }

        if (!activeRestaurantId) {
            setActiveRestaurantId(restaurantId);
        }

        setCartItems(prev => {
            const existingItem = prev.find(item => item._id === product._id);
            if (existingItem) {
                return prev.map(item => 
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item)
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const updated = prev.filter(item => item._id !== productId);
            if (updated.length === 0) setActiveRestaurantId(null);
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setActiveRestaurantId(null);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, addToCart, updateQuantity, removeFromCart, clearCart, 
            totalItems, totalPrice, activeRestaurantId 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);