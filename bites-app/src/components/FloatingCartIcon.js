import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../../App'; 

const FloatingCartIcon = () => {
    const navigation = useNavigation();
    const { cartItems, activeRestaurantId } = useCart();
    const [currentRouteName, setCurrentRouteName] = useState('');

    useEffect(() => {
        const updateRoute = () => {
            if (navigationRef.isReady()) {
                const currentRoute = navigationRef.getCurrentRoute();
                setCurrentRouteName(currentRoute?.name || '');
            }
        };

        updateRoute();
        const unsubscribe = navigationRef.addListener('state', updateRoute);
        return unsubscribe;
    }, []);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const isAllowedScreen = currentRouteName === 'Home' || currentRouteName === 'RestaurantMenu';
    if (!isAllowedScreen || totalItems === 0) {
        return null;
    }

    if (currentRouteName === 'RestaurantMenu') {
        const currentParams = navigationRef.getCurrentRoute()?.params;
        if (currentParams?.id === activeRestaurantId) {
            return null;
        }
    }

    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={() => navigation.navigate('Checkout')} 
            activeOpacity={0.8}
        >
            <Ionicons name="cart-outline" size={26} color="#000000" />
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    badge: {
        position: 'absolute',
        top: -4,
        left: -4,
        backgroundColor: '#202125',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '900',
    },
});

export default FloatingCartIcon;