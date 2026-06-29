import React, { useState, useEffect } from 'react';
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
    
    // Destructured addToCart from useCart context to handle cross-selling interactions
    const { cartItems, totalPrice, totalItems, clearCart, activeRestaurantId, showToast, addToCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for the recommendation engine
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const DELIVERY_FEE = 12;
    const finalAmount = totalPrice + DELIVERY_FEE;

    // Fetch recommendations with fallback and filtering logic
    useEffect(() => {
        if (!activeRestaurantId || cartItems.length === 0) {
            setRecommendations([]);
            return;
        }

        const fetchRecommendations = async () => {
            try {
                setLoadingRecs(true);
                
                // 1. Initial attempt to fetch from C++ Gateway / recommendations endpoint
                const recsResponse = await fetch(`${API_BASE_URL}/api/recommendations?restaurantId=${activeRestaurantId}`);
                let recData = [];
                
                if (recsResponse.ok) {
                    recData = await recsResponse.json();
                }

                // 2. Fallback logic: If empty or failed, fetch all restaurant products and pick 3 random ones
                if (!recData || recData.length === 0) {
                    const fallbackResponse = await fetch(`${API_BASE_URL}/api/products?restaurantId=${activeRestaurantId}`);
                    if (fallbackResponse.ok) {
                        const allProducts = await fallbackResponse.json();
                        // Random shuffle and slice to get exactly 3 products
                        recData = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
                    }
                }

                // 3. Filter out items already in cart + enrich object with activeRestaurantId context
                const cartIds = new Set(cartItems.map(item => item._id || item.id));
                const enrichedFilteredRecs = recData
                    .filter(item => !cartIds.has(item._id || item.id))
                    .map(item => ({
                        ...item,
                        restaurantId: activeRestaurantId // Ensures correct restaurant context
                    }));

                setRecommendations(enrichedFilteredRecs);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecommendations();
    }, [activeRestaurantId, cartItems.length]); // Triggers when active restaurant changes or cart item length updates

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
            showToast('Your cart is empty', 'error');
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
                user?.id ||
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

                    <Text
                        style={[
                            styles.itemMeta,
                            { color: theme.textMuted || theme.mutedText || '#7b8490' }
                        ]}
                    >
                        ×{item.quantity}
                    </Text>

                    <Text style={styles.brandPrice}>₪{item.price}</Text>
                </View>
            </View>
        );
    };

    // UI Component for the horizontal recommendations list
    const renderRecommendationsSection = () => {
        if (loadingRecs) {
            return (
                <View style={styles.recsLoadingContainer}>
                    <ActivityIndicator color="#00c2e8" size="small" />
                </View>
            );
        }

        if (recommendations.length === 0) return null;

        return (
            <View style={styles.recsContainer}>
                <Text style={[styles.recsTitle, { color: theme.text }]}>
                    Want to add a little something? 🍕
                </Text>
                <FlatList
                    horizontal
                    data={recommendations}
                    keyExtractor={(item) => `rec-${item._id || item.id}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recsHorizontalList}
                    renderItem={({ item }) => {
                        const formattedUrl = formatImageUrl(item.imageUrl || item.image);
                        const imageSource = formattedUrl ? { uri: formattedUrl } : require('../../assets/icon.png');

                        return (
                            <View style={[styles.recCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Image source={imageSource} style={styles.recImage} resizeMode="cover" />
                                <View style={styles.recDetails}>
                                    <Text style={[styles.recName, { color: theme.text }]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.recPrice}>₪{item.price}</Text>
                                    <TouchableOpacity 
                                        style={styles.recAddButton} 
                                        onPress={() => {
                                            if (addToCart) {
                                                addToCart(item);
                                                showToast(`${item.name} added to cart!`, 'success');
                                            }
                                        }}
                                    >
                                        <Text style={styles.recAddButtonText}>+ Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
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
                    ListFooterComponent={renderRecommendationsSection} // Renders recommendations right below cart items safely
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
                    disabled={isSubmitting || cartItems.length === 0}
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
    // New styles for the cross-selling recommendation engine
    recsContainer: {
        marginTop: 25,
        marginBottom: 10,
    },
    recsTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'left',
    },
    recsLoadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    recsHorizontalList: {
        paddingBottom: 10,
    },
    recCard: {
        width: 130,
        borderRadius: 14,
        marginRight: 14,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    recImage: {
        width: '100%',
        height: 80,
        backgroundColor: '#eaeaea',
    },
    recDetails: {
        padding: 8,
        alignItems: 'flex-start',
    },
    recName: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
        width: '100%',
    },
    recPrice: {
        fontSize: 13,
        fontWeight: '800',
        color: '#00c2e8',
        marginBottom: 6,
    },
    recAddButton: {
        backgroundColor: '#00c2e8',
        paddingVertical: 5,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    recAddButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
    }
});

export default CheckoutScreen;