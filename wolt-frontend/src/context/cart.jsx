import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

const GUEST_CART_KEY = 'delivery_cart_guest';

const getCurrentUser = () => {
    try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
};

const getUserCartKey = () => {
    const user = getCurrentUser();

    if (!user) {
        return GUEST_CART_KEY;
    }

    const userIdentifier = user.userId || user._id || user.username;

    return userIdentifier ? `delivery_cart_user_${userIdentifier}` : GUEST_CART_KEY;
};

const getEmptyCart = () => ({
    cartItems: [],
    activeRestaurantId: null,
});

const loadCartFromStorage = (key) => {
    try {
        const savedCart = localStorage.getItem(key);

        if (!savedCart) {
            return getEmptyCart();
        }

        const parsedCart = JSON.parse(savedCart);

        return {
            cartItems: parsedCart.cartItems || [],
            activeRestaurantId: parsedCart.activeRestaurantId || null,
        };
    } catch {
        return getEmptyCart();
    }
};

const saveCartToStorage = (key, cartItems, activeRestaurantId) => {
    localStorage.setItem(
        key,
        JSON.stringify({
            cartItems,
            activeRestaurantId,
        })
    );
};

const mergeCartItems = (existingItems, guestItems) => {
    const merged = [...existingItems];

    guestItems.forEach((guestItem) => {
        const existingItem = merged.find((item) => item._id === guestItem._id);

        if (existingItem) {
            existingItem.quantity += guestItem.quantity;
        } else {
            merged.push(guestItem);
        }
    });

    return merged;
};

export const CartProvider = ({ children }) => {
    const [cartStorageKey, setCartStorageKey] = useState(getUserCartKey);

    const [cartItems, setCartItems] = useState(() => {
        const key = getUserCartKey();
        return loadCartFromStorage(key).cartItems;
    });

    const [activeRestaurantId, setActiveRestaurantId] = useState(() => {
        const key = getUserCartKey();
        return loadCartFromStorage(key).activeRestaurantId;
    });

    const loadCartForCurrentUser = () => {
        const newKey = getUserCartKey();

        const guestCart = loadCartFromStorage(GUEST_CART_KEY);
        const userCart = loadCartFromStorage(newKey);

        const isLoggedIn = newKey !== GUEST_CART_KEY;

        if (isLoggedIn && guestCart.cartItems.length > 0) {
            let finalCartItems = guestCart.cartItems;
            let finalRestaurantId = guestCart.activeRestaurantId;

            if (
                userCart.cartItems.length > 0 &&
                userCart.activeRestaurantId === guestCart.activeRestaurantId
            ) {
                finalCartItems = mergeCartItems(userCart.cartItems, guestCart.cartItems);
                finalRestaurantId = userCart.activeRestaurantId;
            }

            saveCartToStorage(newKey, finalCartItems, finalRestaurantId);
            localStorage.removeItem(GUEST_CART_KEY);

            setCartStorageKey(newKey);
            setCartItems(finalCartItems);
            setActiveRestaurantId(finalRestaurantId);
            return;
        }

        setCartStorageKey(newKey);
        setCartItems(userCart.cartItems);
        setActiveRestaurantId(userCart.activeRestaurantId);
    };

    useEffect(() => {
        loadCartForCurrentUser();

        const handleAuthChanged = () => {
            loadCartForCurrentUser();
        };

        window.addEventListener('auth-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-changed', handleAuthChanged);
        };
    }, []);

    useEffect(() => {
        saveCartToStorage(cartStorageKey, cartItems, activeRestaurantId);
    }, [cartItems, activeRestaurantId, cartStorageKey]);

    const addToCart = (product, restaurantId) => {
        if (activeRestaurantId && activeRestaurantId !== restaurantId) {
            const confirmClear = window.confirm(
                'You already have items from another restaurant in your cart. Clear cart and add this item?'
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

        setCartItems((prev) => {
            const existingItem = prev.find((item) => item._id === product._id);

            if (existingItem) {
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
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

        setCartItems((prev) =>
            prev.map((item) =>
                item._id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => {
            const updated = prev.filter((item) => item._id !== productId);

            if (updated.length === 0) {
                setActiveRestaurantId(null);
            }

            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setActiveRestaurantId(null);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                totalItems,
                totalPrice,
                activeRestaurantId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);