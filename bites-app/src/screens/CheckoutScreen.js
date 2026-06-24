import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';

const CheckoutScreen = ({ navigation, user }) => {
    // Extract required cart state and actions
    const { cartItems, totalPrice, totalItems, clearCart, activeRestaurantId, showToast } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fixed delivery fee constant
    const DELIVERY_FEE = 12;
    const finalAmount = totalPrice + DELIVERY_FEE;

    // Helper function to handle image fallbacks and emulator URL rewrites
    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }
        if (url.startsWith('http')) return url;
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    // Main function to submit the order payload to the backend gateway
    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        try {
            setIsSubmitting(true);

            // Construct the payload allowing both authenticated users and guests to order
            const orderPayload = {
                userId: user?.userId || user?._id || user?.id || user?.username || 'guest_user',
                restaurantId: activeRestaurantId,
                items: cartItems.map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: finalAmount,
                status: 'pending'
            };

            // --- ADDED LOGS FOR DEBUGGING ---
            console.log('Sending Payload to:', `${API_BASE_URL}/api/orders`);
            console.log('Payload Data:', JSON.stringify(orderPayload, null, 2));

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            // --- ADDED LOGS FOR RESPONSES ---
            console.log('Server Response Status:', response.status);
            console.log('Server Response OK?:', response.ok);

            if (response.ok) {
                // Success pipeline: clear state, alert user via native toast, and redirect
                await clearCart();
                showToast('Order placed successfully! 🚀', 'success');
                navigation.navigate('Home');
            } else {
                const errorData = await response.json().catch(() => null);
                console.log('Server Error Data:', errorData);
                showToast(errorData?.message || 'Failed to submit order', 'error');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showToast('Network error. Failed to connect to server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render individual item row with image on the left, details on the right
    const renderCartItem = ({ item }) => {
        const formattedUrl = formatImageUrl(item.imageUrl || item.image);
        const imageSource = formattedUrl ? { uri: formattedUrl } : require('../../assets/icon.png');

        return (
            <View style={styles.itemCard}>
                <Image 
                    source={imageSource} 
                    style={styles.itemImage} 
                    resizeMode={formattedUrl ? 'cover' : 'contain'} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>×{item.quantity}</Text>
                    <Text style={styles.brandPrice}>₪{item.price}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 60 }}/> 
            </View>

            {/* Main Order Items Summary list */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No items in your cart.</Text>
                    }
                />
            </View>

            {/* Financial Summary & Action Sticky Footer */}
            <View style={styles.footerCard}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>₪{totalPrice}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Delivery Fee</Text>
                    <Text style={styles.priceValue}>₪{DELIVERY_FEE}</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₪{finalAmount}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting || cartItems.length === 0}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Place Order • ₪{finalAmount}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f5ef', // Consistent brand background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 40,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#dfe3e8',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    backButtonText: {
        color: '#00c2e8',
        fontWeight: '700',
        fontSize: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#202125',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#202125',
        paddingHorizontal: 24,
        marginBottom: 15,
        textAlign: 'left',
    },
    listContainer: {
        paddingHorizontal: 24,
    },
    itemCard: {
        flexDirection: 'row', // Left-to-Right distribution
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#eaeaea',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 14, // Push text to the right side of the image
        alignItems: 'flex-start',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#202125',
        marginBottom: 4,
        textAlign: 'left',
    },
    itemMeta: {
        fontSize: 14,
        color: '#7b8490',
    },
    brandPrice: {
        color: '#00c2e8', // Dynamic brand signature blue
        fontWeight: '800',
    },
    emptyText: {
        textAlign: 'center',
        color: '#7b8490',
        marginTop: 40,
        fontSize: 16,
    },
    footerCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -5 },
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceLabel: {
        color: '#7b8490',
        fontSize: 15,
        fontWeight: '600',
    },
    priceValue: {
        color: '#202125',
        fontSize: 15,
        fontWeight: '700',
    },
    totalRow: {
        borderTopWidth: 1,
        borderColor: '#dfe3e8',
        paddingTop: 12,
        marginBottom: 20,
    },
    totalLabel: {
        color: '#202125',
        fontSize: 17,
        fontWeight: '900',
    },
    totalValue: {
        color: '#00c2e8',
        fontSize: 18,
        fontWeight: '900',
    },
    submitButton: {
        backgroundColor: '#00c2e8',
        padding: 16,
        borderRadius: 18,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
    },
});

export default CheckoutScreen;