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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const CheckoutScreen = ({ navigation, user }) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);
    const { cartItems, totalPrice, totalItems, clearCart, activeRestaurantId, showToast, addToCart, updateQuantity, setCartTrigger } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const DELIVERY_FEE = 12;
    const finalAmount = totalPrice > 0 ? totalPrice + DELIVERY_FEE : 0;

    const formatImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }

        if (url.startsWith('http')) return url;

        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            setShowEmptyCartModal(true);
            return;
        }

        try {
            setIsSubmitting(true);

            const savedUser = await AsyncStorage.getItem('user');
            const parsedUser = savedUser ? JSON.parse(savedUser) : null;

            const finalUserId =
                parsedUser?.userId ||
                parsedUser?._id ||
                parsedUser?.id ||
                user?.userId ||
                user?._id ||
                'guest_user';

            const orderPayload = {
                userId: finalUserId,
                restaurantId: activeRestaurantId,

                products: cartItems.map((item) => ({
                    productId: item._id || item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),

                totalPrice: finalAmount,
                status: 'pending'
            };

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                await clearCart();
                setShowSuccessModal(true);
            } else {
                const errorData = await response.json().catch(() => null);
                console.log('Server Error Data:', errorData);
                showToast(
                    errorData?.error ||
                    errorData?.message ||
                    'Failed to submit order',
                    'error'
                );
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showToast('Network error. Failed to connect to server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCartItem = ({ item }) => {
        const formattedUrl = formatImageUrl(item.imageUrl || item.image);
        const imageSource = formattedUrl
            ? { uri: formattedUrl }
            : require('../../assets/icon.png');

        return (
            <View
                style={[
                    styles.itemCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderWidth: isDark ? 1 : 0
                    }
                ]}
            >
                <Image
                    source={imageSource}
                    style={[
                        styles.itemImage,
                        { backgroundColor: isDark ? theme.inputBg : '#eaeaea' }
                    ]}
                    resizeMode={formattedUrl ? 'cover' : 'contain'}
                />

                <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: theme.text }]}>
                        {item.name}
                    </Text>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                            style={[styles.qtyButton, { backgroundColor: isDark ? theme.border : '#f1f3f5' }]}
                            onPress={() => addToCart(item, activeRestaurantId)}
                        >
                            <Text style={[styles.qtyButtonText, { color: theme.text }]}>+</Text>
                        </TouchableOpacity>

                        <Text style={[styles.qtyText, { color: theme.text }]}>
                            {item.quantity}
                        </Text>

                        <TouchableOpacity 
                            style={[styles.qtyButton, { backgroundColor: isDark ? theme.border : '#f1f3f5' }]}
                            onPress={() => {
                                const targetId = item._id || item.id;
                                const currentQty = item.quantity || 1;

                                updateQuantity(targetId, currentQty - 1);
                                if (setCartTrigger) setCartTrigger((prev) => prev + 1);
                                if (showToast) {
                                    showToast('Dish removed from cart.', 'info');
                                }
                            }}
                        >
                            <Text style={[styles.qtyButtonText, { color: theme.text }]}>-</Text>
                        </TouchableOpacity>
                        
                    </View>

                    <Text style={styles.brandPrice}>₪{item.price}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.background }
            ]}
        >
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    Checkout
                </Text>

                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Order Summary
                </Text>

                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text
                            style={[
                                styles.emptyText,
                                { color: theme.textMuted || theme.mutedText || '#7b8490' }
                            ]}
                        >
                            No items in your cart.
                        </Text>
                    }
                />
            </View>

            <View
                style={[
                    styles.footerCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderTopWidth: isDark ? 1 : 0
                    }
                ]}
            >
                <View style={styles.priceRow}>
                    <Text
                        style={[
                            styles.priceLabel,
                            { color: theme.textMuted || theme.mutedText || '#7b8490' }
                        ]}
                    >
                        Subtotal
                    </Text>

                    <Text style={[styles.priceValue, { color: theme.text }]}>
                        ₪{totalPrice}
                    </Text>
                </View>

                <View style={styles.priceRow}>
                    <Text
                        style={[
                            styles.priceLabel,
                            { color: theme.textMuted || theme.mutedText || '#7b8490' }
                        ]}
                    >
                        Delivery Fee
                    </Text>

                    <Text style={[styles.priceValue, { color: theme.text }]}>
                        ₪{DELIVERY_FEE}
                    </Text>
                </View>

                <View
                    style={[
                        styles.priceRow,
                        styles.totalRow,
                        { borderColor: theme.border }
                    ]}
                >
                    <Text style={[styles.totalLabel, { color: theme.text }]}>
                        Total Amount
                    </Text>

                    <Text style={styles.totalValue}>
                        ₪{finalAmount}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting && styles.disabledButton
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            Place Order • ₪{finalAmount}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {showSuccessModal && (
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.successBox,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                borderWidth: isDark ? 1 : 0
                            }
                        ]}
                    >
                        <Text style={styles.successIcon}>🎉</Text>

                        <Text style={[styles.successTitle, { color: theme.text }]}>
                            order confirmed
                        </Text>

                        <Text
                            style={[
                                styles.successMessage,
                                { color: theme.textMuted || theme.mutedText || '#6c757d' }
                            ]}
                        >
                            The shipment is on its way to you
                        </Text>

                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.popToTop();
                            }}
                        >
                            <Text style={styles.closeModalText}>
                                Back to restaurants feed
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {showEmptyCartModal && (
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.successBox,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                borderWidth: isDark ? 1 : 0,
                                position: 'relative' 
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.closeXButton}
                            onPress={() => setShowEmptyCartModal(false)}
                        >
                            <Text style={[styles.closeXText, { color: theme.text }]}>✕</Text>
                        </TouchableOpacity>

                        <Text style={styles.successIcon}>🛒</Text>

                        <Text style={[styles.successTitle, { color: theme.text }]}>
                            Your cart is empty
                        </Text>

                        <Text
                            style={[
                                styles.successMessage,
                                { color: theme.textMuted || theme.mutedText || '#6c757d' }
                            ]}
                        >
                            Please add products
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 40,
        borderBottomWidth: 1
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10
    },
    backButtonText: {
        color: '#00c2e8',
        fontWeight: '700',
        fontSize: 15
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900'
    },
    content: {
        flex: 1,
        paddingTop: 20
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        paddingHorizontal: 24,
        marginBottom: 15,
        textAlign: 'left'
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20
    },
    itemCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 10
    },
    itemDetails: {
        flex: 1,
        marginLeft: 14,
        alignItems: 'flex-start'
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
        textAlign: 'left'
    },
    itemMeta: {
        fontSize: 14
    },
    brandPrice: {
        color: '#00c2e8',
        fontWeight: '800'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16
    },
    footerCard: {
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -5 }
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    priceLabel: {
        fontSize: 15,
        fontWeight: '600'
    },
    priceValue: {
        fontSize: 15,
        fontWeight: '700'
    },
    totalRow: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginBottom: 20
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: '900'
    },
    totalValue: {
        color: '#00c2e8',
        fontSize: 18,
        fontWeight: '900'
    },
    submitButton: {
        backgroundColor: '#00c2e8',
        padding: 16,
        borderRadius: 18,
        alignItems: 'center'
    },
    disabledButton: {
        opacity: 0.6
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900'
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    },
    successBox: {
        width: '85%',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10
    },
    successIcon: {
        fontSize: 55,
        marginBottom: 15
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center'
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24
    },
    closeModalButton: {
        backgroundColor: '#00c2e8',
        paddingVertical: 14,
        paddingHorizontal: 35,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center'
    },
    closeModalText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    closeXButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 1,
    },
    closeXText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 6,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 12,
    },
});

export default CheckoutScreen;