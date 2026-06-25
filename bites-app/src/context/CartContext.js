import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Toast from '../components/Toast';

const CartContext = createContext();
const GUEST_CART_KEY = 'delivery_cart_guest';

const getUserCartKey = async () => {
    try {
        const savedUser = await AsyncStorage.getItem('user');
        if (!savedUser) return GUEST_CART_KEY;
        const user = JSON.parse(savedUser);
        const userIdentifier = user.userId || user._id || user.username;
        return userIdentifier ? `delivery_cart_user_${userIdentifier}` : GUEST_CART_KEY;
    } catch {
        return GUEST_CART_KEY;
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [activeRestaurantId, setActiveRestaurantId] = useState(null);
    const [cartStorageKey, setCartStorageKey] = useState(GUEST_CART_KEY);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    
    const isSwitchingUser = React.useRef(false);
    
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
    };

    const closeToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    useEffect(() => {
        const initCart = async () => {
            const key = await getUserCartKey();
            setCartStorageKey(key);

            if (key === GUEST_CART_KEY) {
                setCartItems([]);
                setActiveRestaurantId(null);
                return;
            }

            try {
                const savedCart = await AsyncStorage.getItem(key);
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    setCartItems(parsedCart.cartItems || []);
                    setActiveRestaurantId(parsedCart.activeRestaurantId || null);
                } else {
                    setCartItems([]);
                    setActiveRestaurantId(null);
                }
            } catch (error) {
                console.error(error);
            }
        };
        initCart();
    }, [cartStorageKey]);

    useEffect(() => {
        const saveCart = async () => {
            if (isSwitchingUser.current) return;
            if (cartStorageKey === GUEST_CART_KEY) return;
            try {
                await AsyncStorage.setItem(cartStorageKey, JSON.stringify({ cartItems, activeRestaurantId }));
            } catch (error) {
                console.error(error);
            }
        };
        saveCart();
    }, [cartItems, activeRestaurantId, cartStorageKey]);

    const addToCart = (product, restaurantId) => {
        if (activeRestaurantId && activeRestaurantId !== restaurantId) {
            Alert.alert(
                "Replace current cart?",
                "You already have items from another restaurant in your cart.",
                [
                    { text: "Keep Cart", style: "cancel" },
                    { 
                        text: "Clear and Add", 
                        onPress: () => {
                            setCartItems([{ ...product, quantity: 1 }]);
                            setActiveRestaurantId(restaurantId);
                            showToast('Cart cleared and new dish added.', 'success');
                        } 
                    }
                ]
            );
            return;
        }

        if (!activeRestaurantId) setActiveRestaurantId(restaurantId);

        setCartItems((prev) => {
            const existingItem = prev.find((item) => item._id === product._id);
            if (existingItem) {
                showToast('Dish quantity updated in cart.', 'success');
                return prev.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            showToast('Dish added to cart.', 'success');
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) => item._id === productId ? { ...item, quantity: newQuantity } : item)
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => {
            const updated = prev.filter((item) => item._id !== productId);
            if (updated.length === 0) setActiveRestaurantId(null);
            return updated;
        });
        showToast('Dish removed from cart.', 'info');
    };

    const clearCart = async () => {
        setCartItems([]);
        setActiveRestaurantId(null);
        showToast('Cart cleared.', 'info');
        try { await AsyncStorage.removeItem(cartStorageKey); } catch (e) {}
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const refreshCartKey = async () => {
        isSwitchingUser.current = true; 

        const currentItemsBeforeSwitch = [...cartItems];
        const currentRestaurantBeforeSwitch = activeRestaurantId;
        
        const key = await getUserCartKey();
        const oldKey = cartStorageKey;
        setCartStorageKey(key);
        
        try {
            if (oldKey === GUEST_CART_KEY && key !== GUEST_CART_KEY && currentItemsBeforeSwitch.length > 0) {
                await AsyncStorage.setItem(key, JSON.stringify({ 
                    cartItems: currentItemsBeforeSwitch, 
                    activeRestaurantId: currentRestaurantBeforeSwitch 
                }));
                setCartItems(currentItemsBeforeSwitch);
                setActiveRestaurantId(currentRestaurantBeforeSwitch);
            } else if (key === GUEST_CART_KEY) {
                setCartItems([]);
                setActiveRestaurantId(null);
            } else {
                const savedCart = await AsyncStorage.getItem(key);
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    setCartItems(parsedCart.cartItems || []);
                    setActiveRestaurantId(parsedCart.activeRestaurantId || null);
                } else {
                    setCartItems([]);
                    setActiveRestaurantId(null);
                }
            }
        } catch (error) {
            console.error('Error refreshing cart key:', error);
        } finally {
            setTimeout(() => {
                isSwitchingUser.current = false;
            }, 100);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
                totalItems, totalPrice, activeRestaurantId, showToast, 
                refreshCartKey
            }}
        >
            {children}
            
            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={closeToast} />
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);